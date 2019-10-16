/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
The Initial Developer is GeoRobotix Inc. Portions created by the Initial
Developer are Copyright (C) 2019 the Initial Developer. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.sensor.cradlepoint;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;
import org.slf4j.Logger;


/**
 * <p>
 * Utility methods used in all receiver servlets
 * </p>
 *
 * @author Alex Robin
 * @since Feb 9, 2019
 */
public class ServletUtils
{
    static final int ERROR_CODE_CANNOT_READ_MSG = 4000;
    static final int ERROR_CODE_INVALID_MSG_SIZE = 4001;
    static final int ERROR_CODE_INVALID_CONTENT = 4002;
    static final int ERROR_CODE_INTERNAL_ERROR = 5000;
    
    static final int MIN_MSG_LENGTH = 50;
    static final int MAX_MSG_LENGTH = 1024*1024;
    
    
    private ServletUtils()
    {
    }
    
    
    public static byte[] bufferMessage(HttpServletRequest req, Logger log) throws IOException
    {
        // check that message body has content
        if (req.getContentLength() < MIN_MSG_LENGTH)
            throw new IllegalStateException("Message is too short");
        
        // read into buffer
        InputStream is = req.getInputStream();
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int length;
        int size = 0;
        while ((length = is.read(buffer)) != -1)
        {
            // check total size
            size += length;
            if (size > MAX_MSG_LENGTH)
                throw new IllegalStateException("Message is too long");
            
            os.write(buffer, 0, length);
        }
                
        return os.toByteArray();
    }
    
    
    public static void onClientError(HttpServletResponse resp, int errorCode, String msg, byte[] badRequest, Logger log)
    {
        logClientError(errorCode, msg, badRequest, log);        
        resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        sendResponse(resp, errorCode, msg, log);
    }
    
    
    public static void logClientError(int errorCode, String msg, byte[] badRequest, Logger log)
    {
        if (log.isDebugEnabled())
        {
            log.error("Client side error ({}): {}", errorCode, msg);
            
            if (badRequest != null && !log.isTraceEnabled())
                log.error("Message causing error:\n{}", new String(badRequest));
        }
    }
    
    
    public static void onInternalError(HttpServletResponse resp, int errorCode, String msg, byte[] badRequest, Exception e, Logger log)
    {
        logInternalError(errorCode, badRequest, e, log);        
        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        sendResponse(resp, errorCode, msg, log);
    }
    
    
    public static void logInternalError(int errorCode, byte[] badRequest, Exception e, Logger log)
    {
        if (log.isErrorEnabled())
        {
            log.error("Server side error {}", errorCode, e);
            
            if (badRequest != null && !log.isTraceEnabled())
                log.error("Message causing error:\n{}", new String(badRequest));
        }
    }
    
    
    public static void onSuccess(HttpServletResponse resp, Logger log)
    {
        resp.setStatus(HttpServletResponse.SC_OK);
        sendResponse(resp, 0, null, log);
    }
    
    
    public static void sendResponse(HttpServletResponse resp, int errorCode, String msg, Logger log)
    {
        try
        {
            XMLOutputFactory factory = XMLOutputFactory.newInstance();
            XMLStreamWriter writer = factory.createXMLStreamWriter(resp.getOutputStream());

            writer.writeStartDocument();
            writer.writeStartElement("response");
            
            writer.writeStartElement("status");
            writer.writeCharacters(errorCode == 0 ? "SUCCESS" : "ERROR");
            writer.writeEndElement();
            
            writer.writeStartElement("errorCode");
            if (errorCode > 0)
                writer.writeCharacters(Integer.toString(errorCode));
            writer.writeEndElement();
            
            writer.writeStartElement("errorMessage");
            if (msg != null && msg.trim().length() > 0)
                writer.writeCharacters(msg);
            writer.writeEndElement();
            
            writer.writeEndElement();
            writer.writeEndDocument();

            writer.flush();
            writer.close();
        }
        catch (XMLStreamException | IOException e)
        {
            log.error("Error sending response", e);
        }
    }
    
}