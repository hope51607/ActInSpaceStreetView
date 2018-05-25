$(document).ready(function(){
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
            },
            error:function(err){
                console.log('QQ')
                console.log(err)
            }
        })
    
    }
    function initMap(position) {
        var array = [{lat: position.coords.latitude, lng: position.coords.longitude}];
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: array[0]
        });
        array.forEach(point => {
            var marker = new google.maps.Marker({
                position: point,
                map: map
            });
            marker.addListener('click', function() {
               alert("YAA") 
            });
        });
        position={lat: position.coords.latitude, lng: position.coords.longitude}
        getNearest(position);
        getWeather(position)
        getAQI(position)
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

            }
        })
    }


    function fly(){
        let string = "<img src='auto-1941991_960_720.png' style='z-index: 1000; position: absolute; width: 20%;top: 100%; left: "+(Math.floor((Math.random()*50)-10))+"%;'>";
        //console.log(string);
        let newCar =  $( string );
        newCar.appendTo('div');
        //console.log(newCar[0].parentElement);
        Velocity(newCar[0], {
            top : 580,
            left : 350,
            width: 0,
        }, {
            duration: 4000,
            easing: [ 0.3, 0.5, 0.83, 0.67 ],
            complete: function(elements) {
                elements[0].remove();
                fly();
            }
        });
    }

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
        console.log("交通狀況: " + 燈號[tmp])
    }

    getLocation()

    function scene(scene_number,traffic){


        fly();
        setTimeout(fly,200);
        setTimeout(fly,400);
        setTimeout(fly,800);
        setTimeout(fly,1000);
        setTimeout(fly,1200);
        setTimeout(fly,1400);
        setTimeout(fly,1600);
        setTimeout(fly,1800);
        setTimeout(fly,2000);
        setTimeout(fly,2200);
        setTimeout(fly,2400);
        setTimeout(fly,2800);
        setTimeout(fly,3000);
        setTimeout(fly,3200);
        setTimeout(fly,3400);
        setTimeout(fly,3600);
        setTimeout(fly,3800);
        setTimeout(fly,4000);
    }
})
