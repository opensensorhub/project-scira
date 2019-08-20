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

import java.util.ArrayList;
import java.util.List;
import org.sensorhub.api.common.SensorHubException;
import org.sensorhub.api.config.DisplayInfo;
import org.sensorhub.api.config.DisplayInfo.FieldType;
import org.sensorhub.api.config.DisplayInfo.ModuleType;
import org.sensorhub.api.config.DisplayInfo.Required;
import org.sensorhub.api.config.DisplayInfo.FieldType.Type;
import org.sensorhub.api.persistence.IStorageModule;


/**
 * <p>
 * Configuration class for SOS data providers using the persistence API.
 * This class is for a storage only data source. For connecting a sensor
 * with its own storage to an SOS service, use the SensorDataProviderConfig
 * </p>
 *
 * @author Alex Robin <alex.robin@sensiasoftware.com>
 * @since Sep 14, 2013
 */
public class StorageDataProviderConfig extends SOSProviderConfig
{
    
    @Required
    @DisplayInfo(desc="Local ID of storage to use as data source")
    @FieldType(Type.MODULE_ID)
    @ModuleType(IStorageModule.class)
    public String storageID;  
    
    
    @DisplayInfo(desc="Names of data stores whose data will be hidden from the SOS " +
            "If this is null, all streams offered by storage are exposed")
    public List<String> excludedOutputs = new ArrayList<>();
    

    public StorageDataProviderConfig()
    {        
    }
    
    
    /*
     * Copy constructor to configure storage from streaming data provider info
     */
    protected StorageDataProviderConfig(StreamDataProviderConfig streamProducerConfig)
    {
        this.enabled = streamProducerConfig.enabled;
        this.offeringID = streamProducerConfig.offeringID;
        this.name = streamProducerConfig.name;
        this.description = streamProducerConfig.description;
        this.storageID = streamProducerConfig.storageID;
        this.excludedOutputs = streamProducerConfig.excludedOutputs;
        this.maxFois = streamProducerConfig.maxFois;
    }
    
    
    @Override
    protected ISOSDataProviderFactory getFactory(SOSServlet service) throws SensorHubException
    {
        return new StorageDataProviderFactory(service, this);
    }
}
