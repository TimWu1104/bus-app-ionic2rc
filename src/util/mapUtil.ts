// To check if the specify location is in China
export function outOfChina(lng: number, lat: number){
    if (lng < 72.004 || lng > 137.8347)
        return 0;
    if (lat < 0.8293 || lat > 55.8271)
        return 1;

    return 0;
}

export function transformlng(lng: number, lat: number) {
    var PI = 3.1415926535897932384626;
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

export function transformlat(lng: number, lat: number) {
    var PI = 3.1415926535897932384626;
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

// convert point based on GCJ02 to BD09 point which can by used to Baidu map
export function convertGCJ02ToBD09(lng: number, lat: number){
    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = lng;
    var y = lat;
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    return {
    	lng: z * Math.cos(theta) + 0.0065, 
    	lat: z * Math.sin(theta) + 0.006
	};
}

// convert point based on WGS84 which is only applied to Google Earth to GCJ02
export function convertWGS84ToGCJ02(lng: number, lat: number){
    if (outOfChina(lng, lat)) {
        return {
        	lng: lng,
        	lat: lat
        }
    }

    var PI = 3.1415926535897932384626;
    var ee = 0.00669342162296594323;
    var a = 6378245.0;

    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return {
    	lng: mglng,
    	lat: mglat
    };
}

// convert point based on WGS84 standard to BD09 standard which can be used to Baidu map
export function convertWGS84ToBD09(lng: number, lat: number){
	if (outOfChina(lng, lat)) {
        return {
        	lng: lng,
        	lat: lat
        }
    }

    var gcj02Point = convertWGS84ToGCJ02(lng, lat);
    return convertGCJ02ToBD09(gcj02Point.lng, gcj02Point.lat);
}