/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2016-2017 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.vast.ows.sps;

import org.vast.ogc.OGCRegistry;
import org.vast.ows.OWSException;
import org.vast.ows.swe.SWEResponseWriter;
import org.w3c.dom.*;
import org.vast.xml.DOMHelper;


/**
 * <p>
 * Writer to generate an XML InsertTaskingTemplate response for SPS v2.0
 * </p>
 *
 * @author Alex Robin
 * @date Dec 14, 2016
 * */
public class InsertTaskingTemplateResponseWriterV20 extends SWEResponseWriter<InsertTaskingTemplateResponse>
{
		
	public Element buildXMLResponse(DOMHelper dom, InsertTaskingTemplateResponse response, String version) throws OWSException
	{
	    dom.addUserPrefix("sps", OGCRegistry.getNamespaceURI(SPSUtils.SPS, version));
        
        // root element
        Element rootElt = dom.createElement("sps:" + response.getMessageType());
        
        // write extensions
        writeExtensions(dom, rootElt, response);
        
        // session id
        dom.setElementValue(rootElt, "session", response.getSessionID());
        
        return rootElt;
	}
	
}