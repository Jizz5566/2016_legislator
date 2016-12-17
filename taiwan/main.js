$.ajaxSetup({ async: false });

var map, data, nu2, cunliData = [];

$.get('cunli/2016/001.csv', function(data) {
    var lines = $.csv.toArrays(data);
    for (k in lines) {
        if (k > 0) {
            cunliData[lines[k][1]] = lines[k];
            //console.log(cunliData);
        }
    }
});

function initialize() {

    /*map setting*/
    $('#map-canvas').height(window.outerHeight / 2.2);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: { lat: 25.053699, lng: 121.507837 }
    });
    $.ajax({
            url: 'taiwan/cunli.json',
            type: 'GET',
            dataType: 'json'
            //data: { C_Name: "臺北市" },
        })
        .done(function(data) {
            console.log(data);
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });

    $.getJSON('taiwan/cunli.json', {}, function(data) {
        pro = data.objects.cunli.geometries;
        var p = [];
        for (var i = 0; i < pro.length; i++) {
            p[i] = pro[i].properties
            //cunli = map.data.addGeoJson(topojson.feature(data, pro[i]));
            for (var j = 63; j < 69; j++) {
                if (p[i].COUNTY_ID == j) {
                    cunli = map.data.addGeoJson(topojson.feature(data, pro[i]));    //限定county id範圍為六都，使迴圈只跑出此六都的地圖
                }
            }
        }
    });

    cunli.forEach(function(value) {
        var key = value.getProperty('VILLAGE_ID');            //從此六都地圖找出village id欄位值
            console.log(key);
        if (cunliData[key] && cunliData[key] !== 0) {      //用village id作為索引值與選票資料配對
                        //從這裡開始寫迴圈
            value.setProperty('num', cunliData[key][7] / cunliData[key][2]); //當選人得票率
            value.setProperty('num1', cunliData[key][9]); //政黨ID
            value.setProperty('num2', cunliData[key][7] / cunliData[key][4]); //當選人支持率
            value.setProperty('num3', cunliData[key][11] / cunliData[key][2]); //次高票者得票率
            value.setProperty('diff', cunliData[key][7] / cunliData[key][2] - cunliData[key][11] / cunliData[key][2])
        }
    });

    map.data.setStyle(function(feature) {
        color = ColorBar(feature.getProperty('num1'), feature.getProperty('diff'));
        //console.log(feature.getProperty('diff'));
        return {
            fillColor: color,
            fillOpacity: 0.6,
            strokeColor: 'gray',
            strokeWeight: 1
        }
    });

    map.data.addListener('mouseover', function(event) {
        var Cunli = event.feature.getProperty('C_Name') + event.feature.getProperty('T_Name') + event.feature.getProperty('V_Name');
        var p = (event.feature.getProperty('num') * 100).toFixed(2);
        if (isNaN(p)) {
            p = 0;
        }
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { fillColor: 'white' });
        $('#content').html('<div>' + Cunli + ' ：' + p + ' %</div>').removeClass('text-muted');
    });

    map.data.addListener('mouseout', function(event) {
        map.data.revertStyle();
        $('#content').html('在地圖上滑動或點選以顯示數據').addClass('text-muted');
    });

    map.data.addListener('click', function(event) {
        var Cunli = event.feature.getProperty('VILLAGE_ID');
        var CunliTitle = event.feature.getProperty('C_Name') + event.feature.getProperty('T_Name') + event.feature.getProperty('V_Name');
        var dpp = Number(cunliData[Cunli][11]);
        var dpper = cunliData[Cunli][10];
        var kmt = Number(cunliData[Cunli][7]);
        var kmter = cunliData[Cunli][6];
            $(function() {
                Highcharts.setOptions({
                        colors: ['#00C800', '#0000FF', '#ADADAD']
                    });
                    $('#container').highcharts({
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: CunliTitle + "候選人得票數"
                        },
                        xAxis: {
                            categories: [
                                 '2016年政黨得票比較'
                            ],
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: '得票數 (票)'
                            }
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                                '<td style="padding:0"><b>{point.y:.0f} 票</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                pointPadding: 0.2,
                                borderWidth: 0
                            }
                        },
                        series: [{
                            name: dpper,
                            data: [dpp]
                        }, {
                            name: kmter,
                            data: [kmt]
                        }]
                    });
                    $('#container2').highcharts({
                        chart: {
                            plotBackgroundColor: null,
                            plotBorderWidth: null,
                            plotShadow: false,
                            type: 'pie'
                        },
                        title: {
                            text: CunliTitle + "得票率分佈"
                        },
                        tooltip: {
                            pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    format: '<b>{point.name}</b>: {point.percentage:.2f} %',
                                    style: {
                                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                    }
                                }
                            }
                        },
                        series: [{
                            name: "政黨陣營",
                            colorByPoint: true,
                            data: [{
                                name: dpper,
                                y: Number((cunliData[Cunli][11]/cunliData[Cunli][3] * 100).toFixed(2)),
                                sliced: true,
                                selected: true
                            }, {
                                name: kmter,
                                y: Number((cunliData[Cunli][7]/cunliData[Cunli][3] * 100).toFixed(2))
                            }]
                        }]
                    });
            });

        var profile = '<table class="table table-bordered">';
        profile += '<tr><td colspan="2" align="center"><h3>' + CunliTitle + '</h3></td></tr>';
        if (cunliData[Cunli]) {
            profile += '<tr><th>當選人</th><td>' + cunliData[Cunli][6] + '</td></tr>';
            profile += '<tr><th>得票數</th><td>' + cunliData[Cunli][7] + '</td></tr>';
            profile += '<tr><th>當選人得票率</th><td>' + (cunliData[Cunli][7] / cunliData[Cunli][2] * 100).toFixed(2) + ' ％</td></tr>';
            profile += '<tr><th>當選人所屬政黨</th><td>' + cunliData[Cunli][8] + '</td></tr>';
            profile += '<tr><th>投票數</th><td>' + cunliData[Cunli][3] + '</td></tr>';
            profile += '<tr><th>選舉人口數</th><td>' + cunliData[Cunli][4] + '</td></tr>';
            profile += '<tr><th>次高得票者</th><td>' + cunliData[Cunli][10] + '</td></tr>';
            profile += '<tr><th>次高票者所屬政黨</th><td>' + cunliData[Cunli][12] + '</td></tr>';
            profile += '<tr><th>次高得票數</th><td>' + cunliData[Cunli][11] + '</td></tr>';
            profile += '<tr><th>當選人支持率</th><td>' + (cunliData[Cunli][7] / cunliData[Cunli][4] * 100).toFixed(2) + ' ％</td></tr>';
        }
        profile += '</table>';
        $('#cunliProfile').html(profile);
                
    });
};

google.maps.event.addDomListener(window, 'load', initialize);
