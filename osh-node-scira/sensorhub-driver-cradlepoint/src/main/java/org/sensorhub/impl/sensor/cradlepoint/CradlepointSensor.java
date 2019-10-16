/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.

Copyright (C) 2012-2017 Sensia Software LLC. All Rights Reserved.

 ******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.sensor.cradlepoint;

import org.sensorhub.api.common.SensorHubException;
import org.sensorhub.impl.sensor.AbstractSensorModule;
import org.sensorhub.impl.service.HttpServer;


public class CradlepointSensor extends AbstractSensorModule<CradlepointConfig>
{
	CradlepointServlet servlet;

	@Override
	public void init() throws SensorHubException
	{
		super.init();
		// generate identifiers
		this.uniqueID = "urn:osh:sensor:cradlepoint:dataconnect";
		this.xmlID = "CRADLEPOINT_DATACONNECT";

		// TODO
	}



	@Override
	public void start() throws SensorHubException
	{
		// check that HTTP server is ready
		HttpServer httpServer = HttpServer.getInstance();
		if (httpServer == null)
			throw new SensorHubException("HTTP server module is not loaded");

		// deploy servlet
		this.servlet = new CradlepointServlet(this, getLogger());
		httpServer.deployServlet(servlet, config.servletPath);
	}

	@Override
	public void stop() throws SensorHubException
	{
		HttpServer httpServer = HttpServer.getInstance();

		// undeploy servlet
		if (httpServer != null && servlet != null)
			httpServer.undeployServlet(servlet);
	}

	@Override
	public boolean isConnected() {
		return true;
	}
}
