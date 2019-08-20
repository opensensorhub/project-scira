/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2015 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.persistence.perst;

import org.sensorhub.api.module.IModule;
import org.sensorhub.api.module.IModuleProvider;
import org.sensorhub.api.module.ModuleConfig;
import org.sensorhub.impl.module.JarModuleProvider;


/**
 * <p>
 * Descriptor of PERST observation storage module.
 * This is needed for automatic discovery by the ModuleRegistry.
 * </p>
 *
 * @author Alex Robin <alex.robin@sensiasoftware.com>
 * @since May 25, 2015
 */
public class ObsStorageDescriptor extends JarModuleProvider implements IModuleProvider
{

    @Override
    public String getModuleName()
    {
        return "PERST Observation Storage";
    }


    @Override
    public String getModuleDescription()
    {
        return "Datastore for SWE data records and associated features of interest (FOI) based on PERST object database";
    }


    @Override
    public Class<? extends IModule<?>> getModuleClass()
    {
        return ObsStorageImpl.class;
    }


    @Override
    public Class<? extends ModuleConfig> getModuleConfigClass()
    {
        return BasicStorageConfig.class;
    }

}
