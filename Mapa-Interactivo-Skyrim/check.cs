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

        var keysToScan = new List<string> {
            "17f5fc13-2d5a-4289-be68-7d457fa8dd58", // root
            "4a108548-215b-4eda-91e0-9e7aa4751b46", // leftText
            "c0cd9611-1fbd-41ef-98af-298b1cd41382", // rightText
            "98332f69-8468-43b4-8f1d-7758ef349921", // leftButton
            "eec94ae1-1cd0-4b1f-8d70-bb26ccc882c1", // rightButton
            "f53ae908-4df8-4b48-b1e7-5d1a98ea3a38", // nextSpreadBtn
            "8b6aa4a8-1876-48e0-8715-c533df3ca1e8", // prevSpreadBtn
            "b5eb8b03-e50b-4e9c-aa63-4065736fa920", // closeBtn
            "ff5d3ca2-e01e-4509-9b9f-29dcb0f553e7"  // Book image background
        };

        foreach (var id in keysToScan) {
            if (objects.ContainsKey(id)) {
                var obj = (Dictionary<string, object>)objects[id];
                var name = obj.ContainsKey("name") ? obj["name"].ToString() : "";
                if (obj.ContainsKey("components")) {
                    var comps = (Dictionary<string, object>)obj["components"];
                    foreach (var key in comps.Keys) {
                        if (key.StartsWith("toggleVisibilityOnClick") || key.StartsWith("unlockLocationOnClick")) {
                            Console.WriteLine("WARNING: Found " + key + " on " + name + " (" + id + ")");
                        }
                    }
                }
            }
        }
    }
}
