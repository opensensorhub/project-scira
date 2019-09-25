/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2015 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.service.sps;

import org.sensorhub.api.common.SensorHubException;
import org.vast.ows.sps.SPSOfferingCapabilities;
import net.opengis.sensorml.v20.AbstractProcess;
import net.opengis.swe.v20.DataBlock;


/**
 * <p>
 * Interface for all SPS connectors capable of transmitting commands.
 * Implementations can send commands to sensors, process, etc.
 * </p>
 *
 * @author Alex Robin <alex.robin@sensiasoftware.com>
 * @since Dec 13, 2014
 */
public interface ISPSConnector
{
    
    /**
     * @return the configuration of this connector 
     */
    public SPSConnectorConfig getConfig();
    
    
    /**
     * @return true if this connector is enabled, false otherwise
     */
    public boolean isEnabled();
    
    
    /**
     * @return unique ID of procedure linked to this connector
     */
    public String getProcedureID();
    
    
    /**
     * Builds the offering capabilities using the connector configuration
     * This will connect to source to retrieve the necessary metadata
     * @return SPS offering capabilities object containing the maximum of metadata
     * @throws SensorHubException 
     */
    public SPSOfferingCapabilities generateCapabilities() throws SensorHubException;
    
    
    /**
     * Update capabilities previously generated by this connector if needed.
     * The object updated must be the one returned by {@link #generateCapabilities()}
     * @throws SensorHubException 
     */
    public void updateCapabilities() throws SensorHubException;
    
    
    /**
     * Retrieves the SensorML description associated to this connector
     * @param time Time at which the description should be valid 
     * @return the SensorML process object describing the sensor
     * @throws SensorHubException 
     */
    public AbstractProcess generateSensorMLDescription(double time) throws SensorHubException;
    
    
    /**
     * Sends the command data through the connector
     * @param task 
     * @param data
     * @throws SensorHubException
     */
    public void sendSubmitData(ITask task, DataBlock data) throws SensorHubException;
    
    
    /**
     * Called when the connector is removed
     */    
    public void cleanup();
}