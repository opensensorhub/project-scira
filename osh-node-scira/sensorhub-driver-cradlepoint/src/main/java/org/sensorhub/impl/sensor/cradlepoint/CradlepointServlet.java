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

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.stream.XMLStreamException;

import org.sensorhub.api.common.SensorHubException;
import org.slf4j.Logger;


/**
 * <p>
 * HTTP servlet for receiving Cradlepoint messages
 * </p>
 *
 * @author Alex Robin
 * @since Feb 11, 2019
 */
public class CradlepointServlet extends HttpServlet
{
	protected final CradlepointSensor sensor;
	protected final Logger logger;


	public CradlepointServlet(final CradlepointSensor sensor, Logger logger)
	{
		this.sensor = sensor;
		this.logger = logger;
	}


	protected void parseMessage(byte[] msg) throws XMLStreamException, SensorHubException, IOException
	{
		InputStream is = new ByteArrayInputStream(msg);
		// ...
		//        String text = IOUtils.toString(is, StandardCharsets.UTF_8.name());
		//        logger.debug("Received Message: " + text);
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
	{
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
	{
		byte[] msg = null;

		// buffer message
		try
		{
			msg = ServletUtils.bufferMessage(req, logger);
		}
		catch (IOException e)
		{
			ServletUtils.onClientError(resp, ServletUtils.ERROR_CODE_CANNOT_READ_MSG, "Cannot read message", null, logger);
			return;
		}
		catch (IllegalStateException e)
		{
			ServletUtils.onClientError(resp, ServletUtils.ERROR_CODE_INVALID_MSG_SIZE, e.getMessage(), null, logger);
			return;
		}

		// log message at trace level
		logger.debug("Received POST message at endpoint {}", req.getRequestURI());
		if (logger.isTraceEnabled())
			logger.trace("Message Content:\n{}", new String(msg));

		// parse and ingest message
		try
		{
			parseMessage(msg);
		}
		catch (IOException e)
		{
			ServletUtils.onClientError(resp, ServletUtils.ERROR_CODE_CANNOT_READ_MSG, "Cannot read message", null, logger);
			return;
		}
		catch (XMLStreamException e)
		{
			ServletUtils.onClientError(resp, ServletUtils.ERROR_CODE_INVALID_CONTENT, e.getMessage(), msg, logger);
			return;
		}
		catch (SensorHubException e)
		{
			ServletUtils.onInternalError(resp, ServletUtils.ERROR_CODE_INTERNAL_ERROR, "Internal error", msg, e, logger);
			return;
		}

		ServletUtils.onSuccess(resp, logger);
	}

	public static void main(String[] args) {

	}
}
