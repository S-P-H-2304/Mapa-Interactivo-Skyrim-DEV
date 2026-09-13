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

        string id = "b5eb8b03-e50b-4e9c-aa63-4065736fa920"; // Atrás button
        
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
                    Console.WriteLine("Removed " + key + " from closeBtn");
                }
            }
        }

        string newJson = serializer.Serialize(dict);
        File.WriteAllText(path, newJson);
    }
}
