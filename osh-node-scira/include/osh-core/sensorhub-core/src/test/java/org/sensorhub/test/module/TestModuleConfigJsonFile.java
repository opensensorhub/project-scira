/***************************** BEGIN LICENSE BLOCK ***************************

The contents of this file are subject to the Mozilla Public License, v. 2.0.
If a copy of the MPL was not distributed with this file, You can obtain one
at http://mozilla.org/MPL/2.0/.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the License.
 
Copyright (C) 2012-2015 Sensia Software LLC. All Rights Reserved.
 
******************************* END LICENSE BLOCK ***************************/

package org.sensorhub.test.module;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.UUID;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.sensorhub.api.module.ModuleConfig;
import org.sensorhub.api.persistence.StorageConfig;
import org.sensorhub.api.processing.ProcessConfig;
import org.sensorhub.api.sensor.SensorConfig;
import org.sensorhub.api.service.ServiceConfig;
import org.sensorhub.impl.module.ModuleConfigJsonFile;
import org.sensorhub.impl.persistence.InMemoryStorageConfig;
import static org.junit.Assert.*;


public class TestModuleConfigJsonFile
{
    ModuleConfigJsonFile configDb;
    File configFile;
    
    
    @Before
    public void setup() throws Exception
    {
        configFile = new File("test-conf.json");
        configFile.deleteOnExit();
        
        FileUtils.copyURLToFile(TestModuleConfigJsonFile.class.getResource("/module-config.json"), configFile);        
        configDb = new ModuleConfigJsonFile(configFile.getAbsolutePath(), false);
    }
    
    
    @Test
    public void testAdd() throws Exception
    {
        SensorConfig config1 = new SensorConfig();
        config1.id = UUID.randomUUID().toString();
        config1.name = "Sensor1";
        config1.moduleClass = "org.sensorhub.sensor.***";
        configDb.add(config1);
        
        displayFile();
    }
    
    
    @Test(expected=RuntimeException.class)
    public void testAddAndRemove() throws Exception
    {
        SensorConfig config1 = new SensorConfig();
        config1.id = UUID.randomUUID().toString();
        config1.name = "Sensor1";
        config1.moduleClass = "org.sensorhub.sensor.***";
        configDb.add(config1);
        
        displayFile();
        
        configDb.remove(config1.id);
        configDb.get(config1.id);
    }
    
    
    @Test
    public void testAddAndReadBack() throws Exception
    {
        ModuleConfig storedConf;
        
        ProcessConfig config1 = new ProcessConfig();
        config1.id = UUID.randomUUID().toString();
        config1.name = "Process1";
        config1.moduleClass = "org.sensorhub.process.ProcessModel";
        configDb.add(config1);
        
        ServiceConfig config2 = new ServiceConfig();
        config2.id = UUID.randomUUID().toString();
        config2.name = "Service1";
        config2.moduleClass = "org.sensorhub.service.SosService";
        configDb.add(config2);
        
        ServiceConfig config3 = new ServiceConfig();
        config3.id = UUID.randomUUID().toString();
        config3.name = "Service2";
        config3.moduleClass = "org.sensorhub.service.SpsService";
        configDb.add(config3);
        
        StorageConfig config4 = new InMemoryStorageConfig();
        config4.id = UUID.randomUUID().toString();
        config4.name = "DB1";
        config4.moduleClass = "org.sensorhub.persistence.FeatureStorage";
        configDb.add(config4);
        
        // read back
        configDb.commit();
        configDb.close();        
        configDb = new ModuleConfigJsonFile(configFile.getAbsolutePath(), false);
        
        storedConf = configDb.get(config1.id);
        assertTrue(storedConf.id.equals(config1.id));
        assertTrue(storedConf.name.equals(config1.name));
        assertTrue(storedConf.moduleClass.equals(config1.moduleClass));
        
        storedConf = configDb.get(config2.id);
        assertTrue(storedConf.id.equals(config2.id));
        assertTrue(storedConf.name.equals(config2.name));
        assertTrue(storedConf.moduleClass.equals(config2.moduleClass));
        
        storedConf = configDb.get(config3.id);
        assertTrue(storedConf.id.equals(config3.id));
        assertTrue(storedConf.name.equals(config3.name));
        assertTrue(storedConf.moduleClass.equals(config3.moduleClass));
        
        storedConf = configDb.get(config4.id);
        assertTrue(storedConf.id.equals(config4.id));
        assertTrue(storedConf.name.equals(config4.name));
        assertTrue(storedConf.moduleClass.equals(config4.moduleClass));
    }
    
    
    @Test
    public void testRemoveAndReadBack() throws Exception
    {
        ProcessConfig config1 = new ProcessConfig();
        config1.id = UUID.randomUUID().toString();
        config1.name = "Process1";
        config1.moduleClass = "org.sensorhub.process.ProcessModel";
        configDb.add(config1);
        
        ServiceConfig config2 = new ServiceConfig();
        config2.id = UUID.randomUUID().toString();
        config2.name = "Service1";
        config2.moduleClass = "org.sensorhub.service.SosService";
        configDb.add(config2);
        
        assertTrue(configDb.contains(config1.id));
        assertTrue(configDb.contains(config2.id));
        
        // remove one config
        configDb.remove(config1.id);
        
        // read back and check it's not there
        configDb.close();
        configDb = new ModuleConfigJsonFile(configFile.getAbsolutePath(), false);
        
        assertFalse(configDb.contains(config1.id));
    }
    
    
    private void displayFile() throws Exception
    {
        // print out file
        BufferedReader reader = new BufferedReader(new FileReader(configFile));
        String line;
        while ((line = reader.readLine()) != null)
            System.out.println(line);
        reader.close();
    }
    
    
    @After
    public void cleanup()
    {
        if (configFile != null)
            configFile.delete();
    }
}
