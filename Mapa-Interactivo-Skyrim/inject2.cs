using System;
using System.IO;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        string path = "src/.expanse.json";
        string json = File.ReadAllText(path);
        
        var serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = Int32.MaxValue;
        
        var dict = serializer.Deserialize<Dictionary<string, object>>(json);
        var objects = (Dictionary<string, object>)dict["objects"];

        string id = "17f5fc13-2d5a-4289-be68-7d457fa8dd58"; // Universal Panel
        
        if (objects.ContainsKey(id)) {
            var obj = (Dictionary<string, object>)objects[id];
            var comps = (Dictionary<string, object>)obj["components"];
            foreach (var comp in comps) {
                if (comp.Key.StartsWith("rumorBookManager")) {
                    var compObj = (Dictionary<string, object>)comp.Value;
                    var p = (Dictionary<string, object>)compObj["parameters"];
                    
                    p["markerCarreraBlanca"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "0f3a3eb0-58f6-417c-a080-0072c55c600f" } };
                    p["markerTumulo"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "d8df7945-6bf4-4160-98fb-b36cbc56eb3f" } };
                    p["markerAquelarre"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "26daa6ab-8949-416d-8c69-e6ee9977eaed" } };
                    p["markerFalkreath"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "4a8454ed-6fbf-47d1-ae61-45889f692798" } };
                    
                    Console.WriteLine("Injected markers.");
                }
            }
        }

        string newJson = serializer.Serialize(dict);
        File.WriteAllText(path, newJson);
    }
}
