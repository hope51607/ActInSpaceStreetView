$(document).ready(function(){
    var 天氣,空氣,路況
    var check={
        '天氣':false,
        '空氣':false,
        '路況':false
    }
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(initMap,showError);
        } else { 
            alert("可以拜託給個資料嗎ＱＱ");
        }
    }
    
    function showError(error){
        switch(error.code){
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.")
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.")
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.")
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.")
                break;
        }
    }
    
    function getWeather(position){
        // console.log("Latitude: " + position.coords.latitude + 
        // "<br>Longitude: " + position.coords.longitude)
        url='http://api.tecyt.com/api/API0103Weather/GetCountryWeatherByLocation?longitude='+position.lng+'&latitude='+position.lat+'&weatherDataType=Hours72&weatherSupportedLanguage=ChineseTraditional'
        $.get({
            url: url,
            success:function(res){
                // console.log(res)
                // $('#test').text(JSON.stringify(res))
                now_date=new Date()
                var contury=res[0]
                var WeatherDescription=contury['WeatherDescription']
                var i,mn=new Date(99999999999999),mni
                for(i=0;i<WeatherDescription.length;i++){
                    tmpDate=new Date(WeatherDescription[i]['StartDateTime'])
                    // console.log(now_date+'\n'+tmpDate)
                    if(Math.abs(now_date-tmpDate)<mn){
                        mni=i;
                        mn=Math.abs(now_date-tmpDate)
                    }
                }
                // console.log(mni)
                weather=WeatherDescription[mni]['Description']
                console.log("天氣狀況: "+weather)
                天氣="天氣狀況: "+weather
                check.天氣=true
            },
            error:function(err){
                console.log('QQ')
                console.log(err)
            }
        })
    
    }
    function initMap(position) {
        var array = [{lat: position.coords.latitude, lng: position.coords.longitude},{ lat:25.0337869, lng:121.5636697},{lat:25.0105137, lng: 121.5315688},{lat:25.0133917, lng: 121.5393173}];
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: array[0]
        });
        var time=0
        array.forEach(point => {
            setTimeout(function(){
                var marker = new google.maps.Marker({
                    position: point,
                    map: map,
                    // draggable: true,
                    animation: google.maps.Animation.DROP,
                });
                marker.addListener('click', function(jjj) {
                    if (point.lat === 25.0337869){  //101
                        position = point;
                        getNearest(position);
                        getWeather(position)
                        getAQI(position)
                        getNearestUbike(position)
                        console.log("101");
                    }else if(point.lat === 25.0105137){ //寶藏巖
                        position = point;
                        getNearest(position);
                        getWeather(position)
                        getAQI(position)
                        getNearestUbike(position)
                        console.log("寶藏巖");
                    }else if(point.lat === 25.0133917){ //ubike
                        position = point;
                        getNearest(position);
                        getWeather(position)
                        getAQI(position)
                        getNearestUbike(position)
                        console.log("ubike")
                    }else{                              //三創
                        getNearest(position);
                        getWeather(position)
                        getAQI(position)
                        getNearestUbike(position)
                        console.log("三創"); 
                    }   
                });
            },time+=200) 
        });
        map.addListener('click', function(e) {
            placeMarkerAndPanTo(e.latLng, map);
        });
        position={lat: position.coords.latitude, lng: position.coords.longitude}
        // getNearest(position);
        // getWeather(position)
        // getAQI(position)
    }
    var marker
    function placeMarkerAndPanTo(latLng, map) {
        var position={lat:latLng.lat(), lng:latLng.lng()}
        if(marker)
            marker.setMap(null)
        marker = new google.maps.Marker({
          position: latLng,
          map: map
        });
        getNearest(position);
        getWeather(position)
        getAQI(position)
        geocodeLatLng(map,position)
    }
    function geocodeLatLng(map,position) {
        var geocoder = new google.maps.Geocoder;

        var latlng = {lat: parseFloat(position.lat), lng: parseFloat(position.lng)};
        geocoder.geocode({'location': latlng}, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
                // console.log(results)
                var time=0
                while(!(check.天氣&&check.空氣&&check.路況)){
                    time++
                    console.log(check)
                    if(time>20)break
                }
                check.天氣=check.空氣=check.路況=false
                var contentString=
                '<div id="noDemo">'+
                '<strong id="地址">'+results[0].formatted_address+'</strong>'+
                '<p id="空氣">'+空氣+'</p>'+
                '<p id="天氣">'+天氣+'</p>'+
                '<p id="路況">'+路況+'</p>'+
                '</div>'
                var infowindow = new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: '200'
                });
                infowindow.open(map, marker);
                map.panTo(latlng);
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
    }
    function getAQI(position){
        $.get({
            url:"http://opendata2.epa.gov.tw/AQI.json",
            success:function(json){
                var mn=9999999999,nowArea
                // console.log(json)
                json.forEach(area => {
                    var latitude=area['Latitude'], longitude=area['Longitude']                  
                    var dis2=(latitude-position.lat)*(latitude-position.lat)+(longitude-position.lng)*(longitude-position.lng)
                    if(dis2<mn){
                        mn=dis2
                        nowArea=area
                    }
                });
                // console.log(nowArea)
                console.log('空氣品質: '+nowArea['Status'])
               空氣='空氣品質: '+nowArea['Status']
               check.空氣=true
            },
            error:function(err){
                console.log(err)
            }
        })
    }

    var not_break = true;

    function fly0(){
        let string = "<img src='車屁股1.png' style='z-index: 4000; position: absolute; width: 70%;top: 100%; left: "+(Math.floor((Math.random()*130)-150))+"%;'>";
        //console.log(string);
        let newCar =  $( string );
        newCar.appendTo('body');
        //console.log(newCar[0].parentElement);
        Velocity(newCar[0], {
            top : '75%',
            left : '120%',
            width: '10%',
        }, {
            duration: 4000,
            easing: [ 0.3, 0.5, 0.83, 0.67 ],
            begin: function(elements){     // 动画开始时的回调函数
                if (!not_break){
                    elements[0].remove();    
                }
            },
            progress: function(elements){
                if (!not_break){
                    elements[0].remove();    
                }
            },
            complete: function(elements) {
                elements[0].remove();
                if (not_break){
                    fly0();
                }
            }
        });
    }

    $('#scene_zero').click(() => {
        not_break = false;
        $('#myCanvas').css({"visibility":"hidden"});
        $('#scene_zero').css({"visibility":"hidden"});
        $('#scene_one').css({"visibility":"hidden"});
        $('#scene_two').css({"visibility":"hidden"});
        $('#scene_three').css({"visibility":"hidden"});
    })

    function fly1(){
        let string = "<img src='車屁股1.png' style='z-index: 4000; position: absolute; width: 70%;top: 100%; left: "+(Math.floor((Math.random()*130)-150))+"%;'>";
        //console.log(string);
        let newCar =  $( string );
        newCar.appendTo('body');
        //console.log(newCar[0].parentElement);
        Velocity(newCar[0], {
            top : '90%',
            left : '120%',
            width: '10%',
        }, {
            duration: 4000,
            easing: [ 0.3, 0.5, 0.83, 0.67 ],
            begin: function(elements){     // 动画开始时的回调函数
                if (!not_break){
                    elements[0].remove();    
                }
            },
            progress: function(elements){
                if (!not_break){
                    elements[0].remove();    
                }
            },
            complete: function(elements) {
                elements[0].remove();
                if (not_break){
                    fly1();
                }
            }
        });
    }

    $('#myCanvas').click(() => {
        not_break = false;
        $('#myCanvas').css({"visibility":"hidden"});
        $('#scene_zero').css({"visibility":"hidden"});
        $('#scene_one').css({"visibility":"hidden"});
        $('#scene_two').css({"visibility":"hidden"});
        $('#scene_three').css({"visibility":"hidden"});
    })

    $('#scene_two').click(() => {
        // /not_break = false;
        $('#myCanvas').css({"visibility":"hidden"});
        $('#scene_zero').css({"visibility":"hidden"});
        $('#scene_one').css({"visibility":"hidden"});
        $('#scene_two').css({"visibility":"hidden"});
        $('#scene_three').css({"visibility":"hidden"});
    })

    function fly3(){
        let string = "<img src='車屁股1.png' style='z-index: 4000; position: absolute; width: 65%;top: 80%; left: "+(Math.floor((Math.random()*130)-250))+"%;'>";
        //console.log(string);
        let newCar =  $( string );
        newCar.appendTo('body');
        //console.log(newCar[0].parentElement);
        Velocity(newCar[0], {
            top : '50%',
            left : '200%',
            width: '10%',
        }, {
            duration: 4000,
            easing: [ 0.3, 0.5, 0.83, 0.67 ],
            begin: function(elements){     // 动画开始时的回调函数
                if (!not_break){
                    elements[0].remove();    
                }
            },
            progress: function(elements){
                if (!not_break){
                    elements[0].remove();    
                }
            },
            complete: function(elements) {
                elements[0].remove();
                if (not_break){
                    fly3();
                }
            }
        });
    }

    $('#scene_three').click(() => {
        not_break = false;
        $('#myCanvas').css({"visibility":"hidden"});
        $('#scene_zero').css({"visibility":"hidden"});
        $('#scene_one').css({"visibility":"hidden"});
        $('#scene_two').css({"visibility":"hidden"});
        $('#scene_three').css({"visibility":"hidden"});
    })

    function loadCompressedASCIIFile(request_url) {

        var req = new XMLHttpRequest();

        // You gotta trick it into downloading binary.
        req.open('GET', request_url, false);
        req.overrideMimeType('text\/plain; charset=x-user-defined');    
        req.send(null);

        // Check for any error....
        if (req.status != 200) {
            return '';
        }

        // Here's our raw binary.
        var rawfile = req.responseText;

        // Ok you gotta walk all the characters here
        // this is to remove the high-order values.

        // Create a byte array.
        var bytes = [];

        // Walk through each character in the stream.
        for (var fileidx = 0; fileidx < rawfile.length; fileidx++) {
            var abyte = rawfile.charCodeAt(fileidx) & 0xff;
            bytes.push(abyte);
        }

        // Instantiate our zlib object, and gunzip it.    
        // Requires: http://goo.gl/PIqhbC [github]
        // (remove the map instruction at the very end.)
        var  gunzip  =  new  Zlib.Gunzip ( bytes ); 
        var  plain  =  gunzip.decompress ();

        // Now go ahead and create an ascii string from all those bytes.
        var asciistring = "";
        for (var i = 0; i < plain.length; i++) {         
            asciistring += String.fromCharCode(plain[i]);
        }

        return asciistring;
    }

    // credit to: https://webcache.googleusercontent.com/search?q=cache:tB5exByvgx4J:https://blog.csdn.net/yjukh/article/details/5213577+&cd=7&hl=zh-TW&ct=clnk&gl=tw
    function GetPointDistance(p1, p2){
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));
    }
    function GetNearestDistance(PA, PB, P3){

        //----------图2--------------------
        let a,b,c;
        a=GetPointDistance(PB,P3);
        // if(a<=0.00001)
        // return 0;
        b=GetPointDistance(PA,P3);
        // if(b<=0.00001)
        // return 0;
        c=GetPointDistance(PA,PB);
        //if(c<=0.00001)
        //return 0;//如果PA和PB坐标相同，则退出函数，并返回距离
        //------------------------------
        
        if(a*a>=b*b+c*c)//--------图3--------
        return b;      //如果是钝角返回b
        if(b*b>=a*a+c*c)//--------图4-------
        return a;      //如果是钝角返回a
        
        //图1
        let l=(a+b+c)/2;     //周长的一半
        let s= Math.sqrt(l*(l-a)*(l-b)*(l-c));  //海伦公式求面积，也可以用矢量求
        return 2*s/c;
    }

    // function getLocation() {
    //     var pos
    //     var weather
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(getNearest,showError);
    //     } else { 
    //         alert("可以拜託給個資料嗎ＱＱ")
    //     }
    // }
    function showError(error)
    {
        switch(error.code) 
        {
        case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.")
        break;
        case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.")
        break;
        case error.TIMEOUT:
        console.log("The request to get user location timed out.")
        break;
        case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.")
        break;
        }
    }

    function getNearest(position){
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(loadCompressedASCIIFile("https://tcgbusfs.blob.core.windows.net/blobtisv/GetVD.xml.gz"),"text/xml");
        let max = Number.MAX_VALUE;
        let maxNode;
        let posi = Object();
        posi.x = position.lng*100000;
        posi.y =  position.lat*100000;
        //console.log("\o",posi);
        for (let i  = 0;i<xmlDoc.getElementsByTagName("vd:SectionDataSet")[0].childElementCount;i++){
            let tempnode = xmlDoc.getElementsByTagName("vd:SectionDataSet")[0].children[i];
            let p1 = Object();
            p1.x = Number(tempnode.getElementsByTagName("vd:StartWgsX")[0].textContent)*100000;
            p1.y = Number(tempnode.getElementsByTagName("vd:StartWgsY")[0].textContent)*100000;
            let p2 = Object();
            p2.x = Number(tempnode.getElementsByTagName("vd:EndWgsX")[0].textContent)*100000;
            p2.y = Number(tempnode.getElementsByTagName("vd:EndWgsY")[0].textContent)*100000;
            let tempdistance = GetNearestDistance(p1,p2,posi);
            if (tempdistance<max){
                maxnode = tempnode;
                max = tempdistance;
            }
        }
        //console.log(max);
        var 燈號=["綠","橘","紅"]
        var tmp=maxnode.getElementsByTagName("vd:MOELevel")[0].textContent
        if (position.lat === 25.0337869){  //101
            scene(1,Number(tmp))
        }else if(position.lat === 25.0105137){ //寶藏巖
            scene(2,Number(tmp))
        }else if(position.lat === 25.0133917){ //ubike
            scene(3,Number(tmp))
        }else{                              //三創
            scene(0,Number(tmp))
        }
        console.log("交通狀況: " + 燈號[tmp])
        路況="交通狀況: " + 燈號[tmp]
        check.路況=true;
    }

    function getNearestUbike(position){
        let req = new XMLHttpRequest();
    
        // You gotta trick it into downloading binary.
        req.open('GET', "https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.gz", false);  
        req.send(null);
    
        // Check for any error....
        if (req.status != 200) {
            return '';
        }
    
        // Here's our raw binary.
        let rawfile = req.responseText;
        
        let ubike = JSON.parse(rawfile);
        //console.log("",ubike.retVal);
        let max = Number.MAX_VALUE;
        let maxNode;
        let posi = Object();
        posi.x = position.lng;
        posi.y =  position.lat;
        for(let attr in ubike.retVal) {
            let temp = Math.pow((Number(ubike.retVal[attr].lng) - posi.x),2) + Math.pow((Number(ubike.retVal[attr].lat) - posi.y),2)
            if (temp < max){
                max = temp;
                maxNode = ubike.retVal[attr];
            }
        }
        console.log("",maxNode);
    }

    getLocation()

    function scene(scene_number ,traffic){
        switch(scene_number){
            case 0: //三創
                not_break = true;
                fly0();
                $('#scene_zero').css({"visibility":""});
                switch(traffic){
                    case 0:
                        for(let i =200;i<=4000;i+=200){
                            setTimeout(fly0,i);
                        }
                        break;
                    case 1:
                        for(let i =400;i<=4000;i+=400){
                            setTimeout(fly0,i);
                        }
                        break;
                    case 2:
                        for(let i =800;i<=4000;i+=800){
                            setTimeout(fly0,i);
                        }
                        break;
                }
                break;
            case 1: //101
                $('#myCanvas').css({"visibility":""});
                not_break = true;
                fly1();
                $('#scene_one').css({"visibility":""});
                switch(traffic){
                    case 0:
                        for(let i =200;i<=4000;i+=200){
                            setTimeout(fly1,i);
                        }
                        break;
                    case 1:
                        for(let i =400;i<=4000;i+=400){
                            setTimeout(fly1,i);
                        }
                        break;
                    case 2:
                        for(let i =800;i<=4000;i+=800){
                            setTimeout(fly1,i);
                        }
                        break;
                }
                break;
            case 2: //寶藏巖
                // not_break = true;
                // fly2();
                $('#scene_two').css({"visibility":""});
                // switch(traffic){
                //     case 0:
                //         for(let i =200;i<=4000;i+=200){
                //             setTimeout(fly2,i);
                //         }
                //         break;
                //     case 1:
                //         for(let i =400;i<=4000;i+=400){
                //             setTimeout(fly2,i);
                //         }
                //         break;
                //     case 2:
                //         for(let i =800;i<=4000;i+=800){
                //             setTimeout(fly2,i);
                //         }
                //         break;
                // }
                break;
            case 3: //ubike
                not_break = true;
                fly3();
                $('#scene_three').css({"visibility":""});
                switch(traffic){
                    case 0:
                        for(let i =200;i<=4000;i+=200){
                            setTimeout(fly3,i);
                        }
                        break;
                    case 1:
                        for(let i =400;i<=4000;i+=400){
                            setTimeout(fly3,i);
                        }
                        break;
                    case 2:
                        for(let i =800;i<=4000;i+=800){
                            setTimeout(fly3,i);
                        }
                        break;
                }
                break;
            case 4: //?
                not_break = true;
                fly4();
                switch(traffic){
                    case 0:
                        for(let i =200;i<=4000;i+=200){
                            setTimeout(fly4,i);
                        }
                        break;
                    case 1:
                        for(let i =400;i<=4000;i+=400){
                            setTimeout(fly4,i);
                        }
                        break;
                    case 2:
                        for(let i =800;i<=4000;i+=800){
                            setTimeout(fly4,i);
                        }
                        break;
                }
                break;
        }
    }
})
