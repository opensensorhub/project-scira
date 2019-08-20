/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.

Copyright (C) 2018 Delta Air Lines, Inc. All Rights Reserved.

******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.impl.sensor.nldn;

import java.util.ArrayList;
import java.util.List;

public class NldnRecord
{
	long timeUtc;
	List<NldnPoint> points = new ArrayList<>();

	class NldnPoint {
		public NldnPoint(float lat, float lon, float val) {
			this.lat = lat;
			this.lon = lon;
			this.value = val;
		}

		float lat;
		float lon;
		float value;
	}
	
	public void addMeshPoint(NldnPoint pt) {
		points.add(pt);
	}
	
	public float [] getLats() {
		float [] lats = new float[points.size()];
		int i=0;
		for (NldnPoint pt: points) {
			lats[i++] = pt.lat;
		}
		return lats;
	}
	
	public float [] getLons() {
		float [] lons = new float[points.size()];
		int i=0;
		for (NldnPoint pt: points) {
			lons[i++] = pt.lon;
		}
		return lons;
	}

	public float [] getValues() {
		float [] vals = new float[points.size()];
		int i=0;
		for (NldnPoint pt: points) {
			vals[i++] = pt.value;
		}
		return vals;
	}
}
