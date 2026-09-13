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

        var idsToClean = new List<string> {
            "f53ae908-4df8-4b48-b1e7-5d1a98ea3a38", // Sig pag
            "8b6aa4a8-1876-48e0-8715-c533df3ca1e8"  // Ant pag
        };
        
        foreach (var id in idsToClean) {
            if (objects.ContainsKey(id)) {
                var obj = (Dictionary<string, object>)objects[id];
                if (obj.ContainsKey("components")) {
                    var comps = (Dictionary<string, object>)obj["components"];
                    var keysToRemove = new List<string>();
                    foreach (var key in comps.Keys) {
                        if (key.StartsWith("toggleVisibilityOnClick")) {
                            keysToRemove.Add(key);
                        }
                    }
                    foreach (var key in keysToRemove) {
                        comps.Remove(key);
                        Console.WriteLine("Removed " + key + " from " + id);
                    }
                }
            }
        }

        string newJson = serializer.Serialize(dict);
        File.WriteAllText(path, newJson);
    }
}
