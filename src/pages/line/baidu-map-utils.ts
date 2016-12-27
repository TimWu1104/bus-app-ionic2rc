import {logError} from '../../util/logUtil';
import {Component, SimpleChange, Input, OnInit, OnChanges, ChangeDetectionStrategy, ElementRef} from '@angular/core';
import {convertWGS84ToBD09} from '../../util/mapUtil';

@Component({
	selector:'baidu-map-utils',
	template:'',
	changeDetection: null, // ChangeDetectionStrategy.CheckAlways
	directives:[]
})

export class BaiduMapUtils implements OnInit{
    previousMarkers: PreviousMarker[] = [];
    BMap: any;
    map: any;
    mapKey: string;
    options: MapOptions;
    win: any = window;
    element: HTMLElement;

    defaultOpts: MapDefaultOptions = {
        navCtrl: true,
        scaleCtrl: true,
        overviewCtrl: true,
        enableScrollWheelZoom: true,
        zoom: 10
    };

    constructor(public el: HTMLElement) {
        this.element = el;
    }

    ngOnInit(){
        // nothing to do
    }

    drawBaiduMap() {
        var MAPURL = `http://api.map.baidu.com/api?v=2.0&ak=${this.mapKey}&callback=baidumapinit`;

        var baiduMap = this.win.baiduMap;
        if (baiduMap && baiduMap.status === 'loading') {
            baiduMap.callbacks.push(() => {
                this.generateMap(this.element);
            });
            return;
        }

        if (baiduMap && baiduMap.status === 'loaded') {
            this.generateMap(this.element);
            return;
        }

        this.win.baiduMap = { status: 'loading', callbacks: [] };
        this.win.baidumapinit = this.getBaiduScriptLoaded(this.element);

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = MAPURL;
        document.body.appendChild(script);
    }

    getBaiduScriptLoaded(el: HTMLElement) {
        return () => {
            this.win.baiduMap.status = 'loaded';
            this.generateMap(this.element);
            this.win.baiduMap.callbacks.forEach(function(cb: Function) {
                cb();
            });
            this.win.baiduMap.callbacks = [];
        };
    }

    generateMap(el: HTMLElement) {
        var BMap = this.BMap = this.win.BMap;
        var map = this.map = new BMap.Map(this.element);
        var opts = <MapOptions>Object.assign({}, this.defaultOpts, this.options);
        map.centerAndZoom(new BMap.Point(opts.center.longitude, opts.center.latitude), opts.zoom);
        if (opts.navCtrl) {
            map.addControl(new BMap.NavigationControl());
        }
        if (opts.scaleCtrl) {
            map.addControl(new BMap.ScaleControl());
        }
        if (opts.overviewCtrl) {
            map.addControl(new BMap.OverviewMapControl());
        }
        if (opts.enableScrollWheelZoom) {
            map.enableScrollWheelZoom();
        }
        this.mark(opts);

        this.addNavigationControl(null, null);
    }

    addNavigationControl(locationSucceed, locationFailed){
        var BMap = this.BMap = this.win.BMap;
        var map = this.map = new BMap.Map(this.element);

        // æ·»åŠ å¸¦æœ‰å®šä½çš„å¯¼èˆªæŽ§ä»¶
        //var navigationControl = new BMap.NavigationControl({
            // é å³ä¸Šè§’ä½ç½®
            //anchor: 1,
            // LARGEç±»åž‹
            //type: 0,
            // å¯ç”¨æ˜¾ç¤ºå®šä½
            //enableGeolocation: true
        //});
        //map.addControl(navigationControl);
        // æ·»åŠ å®šä½æŽ§ä»¶
        var geolocationControl = new BMap.GeolocationControl();
        if (locationSucceed){
            geolocationControl.addEventListener("locationSuccess", locationSucceed);
        }
        if (locationFailed){
            geolocationControl.addEventListener("locationError", locationFailed);
        }
        
        map.addControl(geolocationControl);
    }

    center(opts: MapOptions) {
        var {BMap, map} = this;
        console.log("map="+map);
        console.log("BMap="+BMap);
        if (opts.center) {
        	console.log(opts.center);
            map.setCenter(new BMap.Point(opts.center.longitude, opts.center.latitude));
        }
    }

    zoom(opts: MapOptions) {
        var { map} = this;
        if (opts.zoom) {
            map.setZoom(opts.zoom);
        }
    }

    mark(opts: MapOptions) {
        var {BMap, map} = this;

        if (!opts.markers) {
            return;
        }

        for (let {marker, listener} of this.previousMarkers) {
            marker.removeEventListener('click', listener);
            map.removeOverlay(marker);
        }
        this.previousMarkers.length = 0;

        for (let marker of opts.markers) {
            var pt = new BMap.Point(marker.longitude, marker.latitude);
            var marker2: any;
            if (marker.icon) {
                var icon = new BMap.Icon(marker.icon, new BMap.Size(marker.width, marker.height));
                marker2 = new BMap.Marker(pt, {
                    icon: icon
                });
            } else {
                marker2 = new BMap.Marker(pt);
            }
            map.addOverlay(marker2);
            var previousMarker: PreviousMarker = {
                marker: marker2,
                listener: null
            };
            this.previousMarkers.push(previousMarker);

            if (!marker.title && !marker.content) {
                continue;
            }

            var infoWindow2 = new BMap.InfoWindow('<p>' + (marker.title ? marker.title : '') + '</p><p>' + (marker.content ? marker.content : '') + '</p>', {
                enableMessage: !!marker.enableMessage
            });
            previousMarker.listener = function() {
                this.openInfoWindow(infoWindow2);
            };
            marker2.addEventListener('click', previousMarker.listener);
        }
    }

    locateToBaiduCurrentPosition(){
        var {BMap, map} = this;
        var self = this;

        console.log("BMap = " + BMap);

        var location = new BMap.Geolocation();
        console.log("BMap.Geolocation = " + location);

        var options = {  
            enableHighAccuracy: true, 
            timeout: 60,
            maximumAge:0 
            }; 

        location.getCurrentPosition(function(result){
            var statusCode = location.getStatus();
            console.log("Status code = " + statusCode);
            console.log(result);

            if(statusCode == 0){
                console.log("accuracy = " + result.accuracy);
                map.centerAndZoom(result.point, 17);

                var marker = new BMap.Marker(result.point);
                map.addOverlay(marker);
                var label = new BMap.Label("ä½ çš„ä½ç½®", {offset:new BMap.Size(20,-10)});
                marker.setLabel(label);
            }
        },options);
    }

    locateToGoogleCurrentPosition(){
        var {BMap, map} = this;
        var self = this;

        if (navigator.geolocation){
            var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
            navigator.geolocation.getCurrentPosition(function (position){
                var wgs84Point = new BMap.Point(position.coords.longitude, position.coords.latitude);
                console.log(wgs84Point);
                var bd09Point = convertWGS84ToBD09(113.5771190191858,22.25800282442914);//(wgs84Point.lng, wgs84Point.lat);
                console.log(bd09Point);
                var point = new BMap.Point(bd09Point.lng, bd09Point.lat);
                var marker = new BMap.Marker(point);
                map.addOverlay(marker);
                var label = new BMap.Label("YOU", {offset:new BMap.Size(20,-10)});
                marker.setLabel(label);
                map.centerAndZoom(point, 17);


            }, function(error){
                console.log(error);
            }, options);
        }
    }
}

export interface MapDefaultOptions {
    navCtrl?: boolean;
    scaleCtrl?: boolean;
    overviewCtrl?: boolean;
    enableScrollWheelZoom?: boolean;
    zoom?: number;
}

export interface PreviousMarker {
    marker: any;
    listener: Function;
}

export interface MapOptions extends MapDefaultOptions {
    center: { longitude: number, latitude: number };
    markers?: { longitude: number, latitude: number, icon?: string, width?: number, height?: number, title?: string, content?: string, enableMessage?: boolean }[];
}