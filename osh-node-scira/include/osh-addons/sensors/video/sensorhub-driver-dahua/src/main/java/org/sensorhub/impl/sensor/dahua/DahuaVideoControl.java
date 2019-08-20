/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
The Initial Developer is Botts Innovative Research Inc.. Portions created by the Initial
Developer are Copyright (C) 2016 the Initial Developer. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.sensor.dahua;


import net.opengis.swe.v20.DataBlock;
import net.opengis.swe.v20.DataComponent;
import org.sensorhub.api.common.CommandStatus;
import org.sensorhub.api.sensor.SensorException;
import org.sensorhub.impl.sensor.AbstractSensorControl;

/**
 * <p>
 * Implementation of sensor interface for generic Dahua Cameras using IP
 * protocol. This particular class provides control of the video
 * camera itself.
 * </p>

 * 
 * @author Mike Botts <mike.botts@botts-inc.com>
 * @since March 2016
 */

public class DahuaVideoControl extends AbstractSensorControl<DahuaCameraDriver>
{

    public DahuaVideoControl(DahuaCameraDriver parentSensor)
    {
        super(parentSensor);
        // TODO Auto-generated constructor stub
    }


    @Override
    public String getName()
    {
        return "videoControl";
    }
    
    
    @Override
    public DataComponent getCommandDescription()
    {
        // TODO Auto-generated method stub
        return null;
    }


    @Override
    public CommandStatus execCommand(DataBlock command) throws SensorException
    {
        // TODO Auto-generated method stub
        return null;
    }


	public void init()
	{
		// TODO Auto-generated method stub
		
	}


	public void stop()
	{
		// TODO Auto-generated method stub
		
	}
    
    

}

