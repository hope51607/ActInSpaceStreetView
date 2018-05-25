$(document).ready(function(){
    function getLocation() {
        var pos
        var weather
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(initMap,showError);
        } else { 
        }
    }
    
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
    
    function getWeather(position){
        pos=position
        console.log("Latitude: " + position.coords.latitude + 
        "<br>Longitude: " + position.coords.longitude)
        url='http://api.tecyt.com/api/API0103Weather/GetCountryWeatherByLocation?longitude='+position.coords.longitude+'&latitude='+position.coords.latitude+'&weatherDataType=Hours72&weatherSupportedLanguage=ChineseTraditional'
        $.get({
            url: url,
            success:function(res){
                console.log(res)
                // $('#test').text(JSON.stringify(res))
                now_date=new Date()
                var contury=res[0]
                var WeatherDescription=contury['WeatherDescription']
                var i,mn=new Date(99999999999999),mni
                for(i=0;i<WeatherDescription.length;i++){
                    tmpDate=new Date(WeatherDescription[i]['StartDateTime'])
                    console.log(now_date+'\n'+tmpDate)
                    if(Math.abs(now_date-tmpDate)<mn){
                        mni=i;
                        mn=Math.abs(now_date-tmpDate)
                    }
                }
                // console.log(mni)
                weather=WeatherDescription[mni]['Description']
                w
                // console.log(weather)
            },
            error:function(err){
                console.log('QQ')
                console.log(err)
            }
        })
    
    }
    function initMap(position) {
        var uluru = {lat: position.coords.latitude, lng: position.coords.longitude};
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 4,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    }
    getLocation()

})
