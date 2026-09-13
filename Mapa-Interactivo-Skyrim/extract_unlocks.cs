using System;
using System.IO;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        string json = File.ReadAllText("old_expanse.json");
        var serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = Int32.MaxValue;
        
        var dict = serializer.Deserialize<Dictionary<string, object>>(json);
        var objects = (Dictionary<string, object>)dict["objects"];

        foreach (var kvp in objects) {
            var obj = (Dictionary<string, object>)kvp.Value;
            var name = obj.ContainsKey("name") ? obj["name"].ToString() : "";
            
            if (obj.ContainsKey("components")) {
                var comps = (Dictionary<string, object>)obj["components"];
                foreach (var comp in comps) {
                    if (comp.Key.StartsWith("unlockLocationOnClick")) {
                        var compObj = (Dictionary<string, object>)comp.Value;
                        if (compObj.ContainsKey("parameters")) {
                            var p = (Dictionary<string, object>)compObj["parameters"];
                            
                            string locName = p.ContainsKey("locationName") ? p["locationName"].ToString() : "";
                            string imgSrc = p.ContainsKey("imageSrc") ? p["imageSrc"].ToString() : "";
                            string markerToUnlock = "";
                            if (p.ContainsKey("markerToUnlock")) {
                                var markerObj = (Dictionary<string, object>)p["markerToUnlock"];
                                markerToUnlock = markerObj["id"].ToString();
                            }
                            
                            Console.WriteLine("Button Name: " + name + " | Location: " + locName + " | Marker: " + markerToUnlock + " | Image: " + imgSrc);
                        }
                    }
                }
            }
        }
    }
}
