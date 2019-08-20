/* AUTO-GENERATED FILE.  DO NOT MODIFY.
 *
 * This class was automatically generated by the
 * java mavlink generator tool. It should not be modified by hand.
 */

// MESSAGE VIBRATION PACKING
package com.MAVLink.common;
import com.MAVLink.MAVLinkPacket;
import com.MAVLink.Messages.MAVLinkMessage;
import com.MAVLink.Messages.MAVLinkPayload;
        
/**
* Vibration levels and accelerometer clipping
*/
public class msg_vibration extends MAVLinkMessage{

    public static final int MAVLINK_MSG_ID_VIBRATION = 241;
    public static final int MAVLINK_MSG_LENGTH = 32;
    private static final long serialVersionUID = MAVLINK_MSG_ID_VIBRATION;


      
    /**
    * Timestamp (micros since boot or Unix epoch)
    */
    public long time_usec;
      
    /**
    * Vibration levels on X-axis
    */
    public float vibration_x;
      
    /**
    * Vibration levels on Y-axis
    */
    public float vibration_y;
      
    /**
    * Vibration levels on Z-axis
    */
    public float vibration_z;
      
    /**
    * first accelerometer clipping count
    */
    public long clipping_0;
      
    /**
    * second accelerometer clipping count
    */
    public long clipping_1;
      
    /**
    * third accelerometer clipping count
    */
    public long clipping_2;
    

    /**
    * Generates the payload for a mavlink message for a message of this type
    * @return
    */
    public MAVLinkPacket pack(){
        MAVLinkPacket packet = new MAVLinkPacket();
        packet.len = MAVLINK_MSG_LENGTH;
        packet.sysid = 255;
        packet.compid = 190;
        packet.msgid = MAVLINK_MSG_ID_VIBRATION;
              
        packet.payload.putUnsignedLong(time_usec);
              
        packet.payload.putFloat(vibration_x);
              
        packet.payload.putFloat(vibration_y);
              
        packet.payload.putFloat(vibration_z);
              
        packet.payload.putUnsignedInt(clipping_0);
              
        packet.payload.putUnsignedInt(clipping_1);
              
        packet.payload.putUnsignedInt(clipping_2);
        
        return packet;
    }

    /**
    * Decode a vibration message into this class fields
    *
    * @param payload The message to decode
    */
    public void unpack(MAVLinkPayload payload) {
        payload.resetIndex();
              
        this.time_usec = payload.getUnsignedLong();
              
        this.vibration_x = payload.getFloat();
              
        this.vibration_y = payload.getFloat();
              
        this.vibration_z = payload.getFloat();
              
        this.clipping_0 = payload.getUnsignedInt();
              
        this.clipping_1 = payload.getUnsignedInt();
              
        this.clipping_2 = payload.getUnsignedInt();
        
    }

    /**
    * Constructor for a new message, just initializes the msgid
    */
    public msg_vibration(){
        msgid = MAVLINK_MSG_ID_VIBRATION;
    }

    /**
    * Constructor for a new message, initializes the message with the payload
    * from a mavlink packet
    *
    */
    public msg_vibration(MAVLinkPacket mavLinkPacket){
        this.sysid = mavLinkPacket.sysid;
        this.compid = mavLinkPacket.compid;
        this.msgid = MAVLINK_MSG_ID_VIBRATION;
        unpack(mavLinkPacket.payload);        
    }

                  
    /**
    * Returns a string with the MSG name and data
    */
    public String toString(){
        return "MAVLINK_MSG_ID_VIBRATION -"+" time_usec:"+time_usec+" vibration_x:"+vibration_x+" vibration_y:"+vibration_y+" vibration_z:"+vibration_z+" clipping_0:"+clipping_0+" clipping_1:"+clipping_1+" clipping_2:"+clipping_2+"";
    }
}
        