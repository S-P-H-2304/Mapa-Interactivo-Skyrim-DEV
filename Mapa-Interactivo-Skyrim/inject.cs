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
                    
                    p["uiNuevaUbicacion"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "57300f21-0ba5-4056-bd67-6fd11acbc745" } };
                    p["imageElement"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "00dcd921-eff0-463b-89f0-3ea9f9e4ffa7" } };
                    p["nameElement"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "02257a0f-f15f-4661-ad15-2f6ea61b47a9" } };
                    p["titleElement"] = new Dictionary<string, object> { { "type", "entity" }, { "id", "1bfb98b8-d613-4732-b4c2-1fd6e8df9c60" } };
                    
                    Console.WriteLine("Injected schema references.");
                }
            }
        }

        string newJson = serializer.Serialize(dict);
        File.WriteAllText(path, newJson);
    }
}
