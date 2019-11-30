/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2015 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.api.persistence;


/**
 * <p>
 * Interface for keys used to index messages (such as commands)
 * </p>
 *
 * @author Alex Robin <alex.robin@sensiasoftware.com>
 * @since Nov 12, 2010
 */
public interface IMessageKey
{
    /**
     * Sets ID of module that the message is targeted to
     * @param localID
     */
    public void setTarget(String localID);
    
    
    /**
     * @return ID of module that the message is targeted to
     */
    public String getTarget();
}
