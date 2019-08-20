/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2015 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.service.sos;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.StatusCode;
import org.eclipse.jetty.websocket.api.WebSocketListener;
import org.sensorhub.impl.service.swe.WebSocketOutputStream;
import org.sensorhub.impl.service.swe.WebSocketUtils;
import org.slf4j.Logger;
import org.vast.ows.OWSException;
import org.vast.ows.OWSRequest;
import org.vast.ows.OWSUtils;
import org.vast.ows.sos.GetResultRequest;


/**
 * <p>
 * Output only websocket for sending SOS live responses
 * </p>
 *
 * @author Alex Robin <alex.robin@sensiasoftware.com>
 * @since Feb 19, 2015
 */
public class SOSWebSocketOut implements WebSocketListener, Runnable
{
    Logger log;
    Session session;
    SOSServlet parentService;
    OWSRequest request;
    String userID;
    WebSocketOutputStream respOutputStream;
    Executor threadPool;
    
    
    public SOSWebSocketOut(SOSServlet parentService, OWSRequest request, String userID, Logger log)
    {
        this.parentService = parentService;
        this.request = request;
        this.userID = userID;
        this.threadPool = Executors.newSingleThreadExecutor();
        this.log = log;
        
        // enforce no XML wrapper to GetResult response
        if (request instanceof GetResultRequest)
            ((GetResultRequest) request).setXmlWrapper(false);
    }
    
    
    @Override
    public void onWebSocketConnect(Session session)
    {
        this.session = session;
        WebSocketUtils.logOpen(session, log);
        
        try
        {
            respOutputStream = new WebSocketOutputStream(session, 1024);
            request.setResponseStream(respOutputStream);
            
            // launch processing in separate thread
            threadPool.execute(this);
        }
        catch (Exception e)
        {
            WebSocketUtils.closeSession(session, StatusCode.SERVER_ERROR, WebSocketUtils.INIT_ERROR, log);
        }
    }


    @Override
    public void onWebSocketClose(int statusCode, String reason)
    {
        WebSocketUtils.logClose(session, statusCode, reason, log);
        
        if (respOutputStream != null)
            respOutputStream.close();
        
        session = null;
    }
    
    
    @Override
    public void onWebSocketError(Throwable e)
    {
        log.error(WebSocketUtils.INTERNAL_ERROR_MSG, e);
    }
    
    
    @Override
    public void onWebSocketBinary(byte[] payload, int offset, int len)
    {
        WebSocketUtils.closeSession(session, StatusCode.BAD_DATA, WebSocketUtils.INPUT_NOT_SUPPORTED, log);
    }


    @Override
    public void onWebSocketText(String msg)
    {
        WebSocketUtils.closeSession(session, StatusCode.BAD_DATA, WebSocketUtils.INPUT_NOT_SUPPORTED, log);
    }


    @Override
    public void run()
    {
        try
        {
            // set user in this thread for proper auth
            parentService.securityHandler.setCurrentUser(userID);
            
            // handle request using same servlet logic as for HTTP
            parentService.handleRequest(request);
            
            if (session != null)
                WebSocketUtils.closeSession(session, StatusCode.NORMAL, "Data provider done", log);
        }
        catch (OWSException e)
        {
            if (!OWSUtils.isClientDisconnectError(e))
            {
                log.debug(WebSocketUtils.REQUEST_ERROR_MSG, e);
                if (session != null)
                    WebSocketUtils.closeSession(session, StatusCode.BAD_PAYLOAD, e.getMessage(), log);
            }
        }
        catch (Exception e)
        {
            if (!OWSUtils.isClientDisconnectError(e))
            {
                log.error(WebSocketUtils.RECEIVE_ERROR_MSG, e);
                if (session != null)
                    WebSocketUtils.closeSession(session, StatusCode.SERVER_ERROR, e.getMessage(), log);
            }
        }
    }
}
