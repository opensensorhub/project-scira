/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2016 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.api.security;


/**
 * <p>
 * Interface for permissions parameterized with a value.<br/>
 * This is used for temporal and geofencing for instance.
 * </p>
 *
 * @author Alex Robin
 * @param <ValueType> Type of the parameter value
 * @since Aug 30, 2016
 */
public interface IParameterizedPermission<ValueType> extends IPermission, Cloneable
{

    public ValueType getValue();
    
    public void setValue(ValueType val);
    
    public IParameterizedPermission<ValueType> clone();
}
