/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2015 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.api.sensor;

import org.sensorhub.api.common.SensorHubException;


/**
 * <p>
 * Exceptions generated by the sensor API
 * </p>
 *
 * @author Alex Robin <alex.robin@sensiasoftware.com>
 * @since Sep 5, 2013
 */
public class SensorException extends SensorHubException
{
    private static final long serialVersionUID = -8477183882408329676L;

    
    public SensorException(String message)
    {
        super(message);
    }
    
    
    public SensorException(String message, Throwable cause)
    {
        super(message, cause);
    }
    
    
    public SensorException(String message, int code, Throwable cause)
    {
        super(message, code, cause);
    }    
}
