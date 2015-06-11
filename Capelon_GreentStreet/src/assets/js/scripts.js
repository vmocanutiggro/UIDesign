//Substitute SVG with PNG for non-svg browsers
if (!Modernizr.svg) {
	$('.svg-img').each(function(){
		$(this).attr('src', ($(this).attr('data-png-src')));
	});
}

$(document).ready(function(){
	
	//Placeholders Fix
	$('input, textarea').placeholder();

	//OWL carousel initial

  	$('#bx-carousel').bxSlider({
  		auto: true,
  		pause: 3500,
  		speed: 1200,
  		mode: 'fade',
	    captions: false,
	    controls: false,
	    pager: false
	});
	

});

//Charts action
$(function () {
    // Create the chart
    $('#chart-one').highcharts('StockChart', {

        chart: {
            type: 'area'
        },
        rangeSelector: {
            buttons: [{
                type: 'hour',
                count: 7,
                text: '7h'
            }, {
                type: 'day',
                count: 1,
                text: '1d'
            }, {
                type: 'month',
                count: 1,
                text: '1m'
            },
             {
                 type: 'year',
                 count: 1,
                 text: '1d'
             }],

            inputEnabled: false, // it supports only days
            selected: 2 // all
        },

        title: {
            text: ''
        },

        navigator: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillOpacity: 1,
                stacking: null,
                pointStart: 0,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        scrollbar: {
            barBackgroundColor: '#81b14a',
            barBorderRadius: 7,
            barBorderWidth: 0,
            buttonBackgroundColor: 'transparent',
            buttonBorderWidth: 0,
            buttonBorderRadius: 7,
            trackBackgroundColor: '#688f3b',
            trackBorderWidth: 1,
            trackBorderRadius: 8,
            trackBorderColor: '#CCC'
        },
        series: [
            {
                color:'#fcf892',
                name: 'Used engergy',
                data: [
                /* May 2006 */
                { x: 1147651200000, y: 167.79 },
                [1147737600000, 364.98],
                [1147824000000, 365.26],
                [1147910400000, 363.18],
                [1147996800000, 364.51],
                [1148256000000, 363.38],
                [1148342400000, 363.15],
                [1148428800000, 363.34],
                [1148515200000, 364.33],
                [1148601600000, 363.55],
                [1148947200000, 361.22],
                [1149033600000, 359.77],
                /* Jun 2006 */
                [1149120000000, 162.17],
                [1149206400000, 141.66],
                [1149465600000, 150.00],
                [1149552000000, 129.72],
                [1149638400000, 148.56],
                [1149724800000, 165.76],
                [1149811200000, 119.24],
                [1150070400000, 127.00],
                [1150156800000, 358.33],
                [1150243200000, 147.61],
                [1150329600000, 139.38],
                [1150416000000, 147.56],
                [1150675200000, 147.20],
                [1150761600000, 157.47],
                [1150848000000, 157.86],
                [1150934400000, 139.58],
                [1151020800000, 158.83],
                [1151280000000, 148.99],
                [1151366400000, 127.43],
                [1151452800000, 136.02],
                [1151539200000, 128.97],
                [1151625600000, 157.27]
                ],
            tooltip: {
                valueDecimals: 2
            }
            },
            {
                name: 'Saved engergy',
                color: 'color: "#83c950"',
                data: [
                /* May 2006 */
                { x: 1147651200000, y: 167.79 },
                [1147737600000, 164.98],
                [1147824000000, 165.26],
                [1147910400000, 163.18],
                [1147996800000, 164.51],
                [1148256000000, 163.38],
                [1148342400000, 163.15],
                [1148428800000, 163.34],
                [1148515200000, 164.33],
                [1148601600000, 163.55],
                [1148947200000, 161.22],
                [1149033600000, 159.77],
                /* Jun 2006 */
                [1149120000000, 112.17],
                [1149206400000, 101.66],
                [1149465600000, 89.00],
                [1149552000000, 80.72],
                [1149638400000, 81.56],
                [1149724800000, 105.76],
                [1149811200000, 100.24],
                [1150070400000, 107.00],
                [1150156800000, 318.33],
                [1150243200000, 127.61],
                [1150329600000, 100.38],
                [1150416000000, 107.56],
                [1150675200000, 107.20],
                [1150761600000, 117.47],
                [1150848000000, 127.86],
                [1150934400000, 109.58],
                [1151020800000, 118.83],
                [1151280000000, 108.99],
                [1151366400000, 117.43],
                [1151452800000, 106.02],
                [1151539200000, 108.97],
                [1151625600000, 117.27]
                ],
                tooltip: {
                    valueDecimals: 2
                }
            }


        ]
    });

});

$(function () {
    $('#chart-second').highcharts({
    	colors: ["#fcf892", "#83c950"],
        chart: {
            type: 'area'
        },
        title: {
            text: ''
        },
        xAxis: {
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value; // clean, unformatted number for year
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return this.value / 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
        },
        plotOptions: {
            area: {
                pointStart: 1940,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Used engergy',
            data: [null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
                1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
                27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
                26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
                24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
                22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
                10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
        }, {
            name: 'Saved engergy',
            data: [null, null, null, null, null, null, null, null, null, null,
                5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
                4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
                15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
                33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
                35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
                21000, 20000, 19000, 18000, 18000, 17000, 16000]
        }]
    });
});

$(function () {
    $('#chart-third').highcharts({
    	colors: ["#fcf892", "#83c950"],
        chart: {
            type: 'area'
        },
        title: {
            text: ''
        },
        xAxis: {
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value; // clean, unformatted number for year
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return this.value / 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
        },
        plotOptions: {
            area: {
                pointStart: 1940,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Used engergy',
            data: [null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
                1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
                27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
                26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
                24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
                22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
                10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
        }, {
            name: 'Saved engergy',
            data: [null, null, null, null, null, null, null, null, null, null,
                5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
                4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
                15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
                33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
                35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
                21000, 20000, 19000, 18000, 18000, 17000, 16000]
        }]
    });
});

$(function () {
    $('#chart-fourth').highcharts({
    	colors: ["#fcf892", "#83c950"],
        chart: {
            type: 'area'
        },
        title: {
            text: ''
        },
        xAxis: {
            allowDecimals: false,
            labels: {
                formatter: function () {
                    return this.value; // clean, unformatted number for year
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return this.value / 1000 + 'k';
                }
            }
        },
        tooltip: {
            pointFormat: '{series.name} produced <b>{point.y:,.0f}</b><br/>warheads in {point.x}'
        },
        plotOptions: {
            area: {
                pointStart: 1940,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            name: 'Used engergy',
            data: [null, null, null, null, null, 6, 11, 32, 110, 235, 369, 640,
                1005, 1436, 2063, 3057, 4618, 6444, 9822, 15468, 20434, 24126,
                27387, 29459, 31056, 31982, 32040, 31233, 29224, 27342, 26662,
                26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826, 24605,
                24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
                22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950,
                10871, 10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104]
        }, {
            name: 'Saved engergy',
            data: [null, null, null, null, null, null, null, null, null, null,
                5, 25, 50, 120, 150, 200, 426, 660, 869, 1060, 1605, 2471, 3322,
                4238, 5221, 6129, 7089, 8339, 9399, 10538, 11643, 13092, 14478,
                15915, 17385, 19055, 21205, 23044, 25393, 27935, 30062, 32049,
                33952, 35804, 37431, 39197, 45000, 43000, 41000, 39000, 37000,
                35000, 33000, 31000, 29000, 27000, 25000, 24000, 23000, 22000,
                21000, 20000, 19000, 18000, 18000, 17000, 16000]
        }]
    });
});




$(window).load(function(){
	
});


$(window).resize(function(){
	
});

$(window).scroll(function() {    

});

