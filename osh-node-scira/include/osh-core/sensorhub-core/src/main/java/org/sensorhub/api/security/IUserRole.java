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
 * Base interface for object representing roles in the security API.<br/>
 * Roles are sets of allowed and denied permissions that are associated to users
 * </p>
 *
 * @author Alex Robin
 * @since Aug 22, 2016
 */
public interface IUserRole extends IUserPermissions
{    
    public String getId();
    
    public String getName();
    
    public String getDescription();
}
