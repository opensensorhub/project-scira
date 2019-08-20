/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2016 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.security;

import java.util.ArrayDeque;
import java.util.Iterator;
import org.sensorhub.api.security.IPermission;
import org.sensorhub.api.security.IPermissionPath;


public class PermissionSetting extends ArrayDeque<IPermission> implements IPermissionPath
{
    private static final long serialVersionUID = 7266587754134674522L;


    public PermissionSetting()
    {        
    }
    
    
    public PermissionSetting(IPermission perm)
    {
        super(10);
        
        // add all ancestor permissions to list
        do { addFirst(perm); }
        while ((perm = perm.getParent()) != null);
    }
    
    
    @Override
    public boolean implies(IPermissionPath permList)
    {
        Iterator<IPermission> otherIt = permList.iterator();
        
        for (IPermission perm: this)
        {
            if (!otherIt.hasNext())
                return true;
            
            IPermission requested = otherIt.next();
            if (!perm.implies(requested))
                return false;
        }
        
        return true;
    }

}
