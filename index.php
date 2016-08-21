<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/html">
<head>
    <meta charset="UTF-8">
    <title>map</title>

    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css">
    <script src="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js"></script>

    <script src="javascript/Control.Geocoder.js"></script>
    <script type="text/javascript" src="javascript/map.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>

    <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>

<!--    j-Query UI-->
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/timepicker/1.3.5/jquery.timepicker.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/timepicker/1.3.5/jquery.timepicker.min.js"></script>

    <script src="javascript/lang.js"></script>
    <script src="javascript/additionalFunctions.js"></script>

    <!--    CSS-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="css/style.css">

    <script src="javascript/leaflet-routing-machine.js"></script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
</head>

<body>

    <div id="mapid">
<!-- Empty div for the map-->
    </div>

<!--div for language buttons-->
    <div class="pull-right " id="myNavbar">
        <ul class="nav navbar-nav">
            <li id="FI"><a href="/">FI</a></li>
            <li id="SV"><a href="?lang=sv">SV</a></li>
            <li id="EN"><a href="?lang=en">EN</a></li>
        </ul>
    </div>

<!--div for logo an mode options-->
    <div class="logo">
        <div id="logoTitle"></div>
        <div id="modeListBoxSelect">
            <div id="walk" class="walkIconClicked"></div>
            <div id="bicycle" class="bikeIcon"></div>
            <div id="car" class="carIcon"></div>
            <div id="bus" class="busIcon"></div>
            <div id="park-and-ride" class="parkRideIcon"></div>
            <div id="settings" class="settingsIcon"></div>
        </div>
    </div>

<!--Appeares when mode options on hover -->
    <div id="tipMode" class="toolTip">
        <p id="tipWalk" style="display: none"></p>
        <p id="tipBike" style="display: none"></p>
        <p id="tipCar" style="display: none"></p>
        <p id="tipBus" style="display: none"></p>
        <p id="tipPR" style="display: none"></p>
        <p id="tipSettings" style="display: none"></p>
    </div>

<!--Appeares when trees image on hover-->
    <div id="tipCO2" class="toolTip">
        <p id="co2Calc" style="display: none"></p>
        <p id="offsetCalc" style="display: none"></p>
    </div>

<!--div for displaying date and time settings-->
    <div class="now-later">
        <div class="time-options">
            <input type="radio" id="nowID" name="timeOption" value="Now" checked><label for="nowID"></label>
            <input type="radio" id="depID" name="timeOption" value="Departure"><label for="depID"></label>
            <input type="radio" id="arrID" name="timeOption" value="Arrival"><label for="arrID"></label>
        </div>
        <div class="DateTimeInput">
            <input type="text" id="dateId" name="date" disabled="disabled">
            <input type="time" id="timeId" name="time" disabled="disabled">
        </div>
    </div>

<!--div appeares if error happened during route calculation-->
    <div id="error">
        <span></span>
    </div>

<!--Several divs which appeare when settings button is clicked. Each mode has specific settings (div bellow)-->

    <div class="walkSpeed">
        <div class="row">
            <div class="col-md-6">
                <label id="walkSpeed"></label>
            </div>
            <div class="col-md-6">
                <select class="text-field" id="walkSpeedInput">
                    <option id="walkFast" value="1.8"></option>
                    <option id="walkMedium" value="1.4" selected="selected"></option>
                    <option id="walkSlow" value="1.2"></option>
                </select>
            </div>
        </div>
    </div>

    <div class="bikeSpeed">
        <div class="row">
            <div class="col-md-6">
                <label id="bikeSpeed"></label>
            </div>
            <div class="col-md-6">
                <select class="text-field" id="bikeSpeedInput">
                    <option id="bikeFast" value="8"></option>
                    <option id="bikeMedium" value="7" selected="selected"></option>
                    <option id="bikeSlow" value="6"></option></select>
            </div>
        </div>
    </div>

    <div class="walkDistance">
        <div class="row">
            <div class="col-md-6">
                <label id="walkDistance"></label>
            </div>
            <div class="col-md-6">
                <input type=number value="10000" class="text-field" id="walkDistInput">
            </div>
        </div>
    </div>

    <div class="carbonDioxide">

        <div class="row">
            <div class="col-md-6">
                <label id="emission"></label>
            </div>
            <div class="col-md-6">
                <input type=number value="" class="text-field" id="emissionInput">
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <label id="consumption"></label>
            </div>
            <div class="col-md-6">
                <input type=number value="" class="text-field" id="consumptionInput">
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <label id="fuelType"></label>
            </div>
            <div class="col-md-6">
                <select class="text-field" id="fuelTypeInput">
                    <option id="petrol" value="2325" selected="selected"></option>
                    <option id="diesel" value="2660"></option>
                    <option id="electric" value="0"></option>    //// value
                </select>
            </div>
        </div>
    </div>

    <div class="applyDiv">
        <button type="button" class="applyBtn">
        </button>
    </div>

<!--Additional buttons added for mobile screen-->
    <button class="langButton">
        <div id="langArrow" class="arrow-up"></div>
    </button>

    <div id="mobileButtons">
        <button type="button" class="changeRoute">
        </button>
        <button type="button"" class="hideAlternative">
            <div id="altArrow" class="arrow-up"></div>
        </button>
    </div>

    <div id="mobile-indicator"></div>
</body>

</html>