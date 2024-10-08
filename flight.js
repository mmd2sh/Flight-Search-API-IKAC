!function() {
    if (!window.mbFlightScriptInited) { // FIX MODULE BUILDER RUN TWICE!!!
        window.mbFlightScriptInited = true;
        
        $('.search-flights-wrap').each(function(_, wrap) {
            var input = $('.search-flight-input', wrap);
            var url = input.attr('href');
            
            input.on('change input paste keypress keyup', function(ev) {
                var key = ev.keyCode || ev.which;
                
                if (key === 13) { // if enter pressed
                    ev.preventDefault();
                    $('.search-flight-btn')[0].click();
                }
                
                $('.search-flight-btn').attr('href', url + this.value);
                
                if (ev.type == 'keyup') {
                    var val = this.value.trim().toLowerCase();
                    $('.search-flights-list li', wrap).each(function(_, item) {
                        if (item.textContent.toLowerCase().includes(engDigit(val))) {
                            $(item).addClass('active');
                        } else {
                            $(item).removeClass('active');
                        }
                        
                        if (val.trim() == '') {
                            $(item).removeClass('active');
                        }
                    });
                }
                
            });
            
            $('.search-flights-list', wrap).html('');
            
            // fetch type a data
            fetchData('https://87.107.20.9/inf/?typf=A');
            
            // fetch type b data
            setTimeout(function() {
                fetchData('https://87.107.20.9/inf/?typf=B');
            }, 1000);
            
            // API fetch
            function fetchData(url) {
                fetch(url)
                .then(res => {
                    if (!res.ok) {
                        console.error('Network response error.');
                        $('.flight-api-status-loading', wrap).hide();
                        $('.flight-api-status-fail', wrap).show();
                        
                        setTimeout(function() {
                            $('.flight-api-status-fail', wrap).hide();
                        }, 5000);
                    }
                    return res.json();
                })
                .then(data => {
                    $('.flight-api-status-loading', wrap).hide();
                    $('.flight-api-status-success', wrap).show();
                    
                    setTimeout(function() {
                        $('.flight-api-status-success', wrap).hide();
                    }, 5000);
                    
                    // strore flight data in list
                    storeData(data);
                    
                })
                .catch(err => {
                    console.error(err);
                    $('.flight-api-status-loading', wrap).hide();
                    $('.flight-api-status-fail', wrap).show();
                    
                    setTimeout(function() {
                        $('.flight-api-status-fail', wrap).hide();
                    }, 5000);
                });
            }
            
            // stroe flight data in list
            function storeData(data) {
                
                data.map(function(flight) {

                    if (flight.Scheduled) {
                        var bookDate = engDigit(new Date(flight.Scheduled).toLocaleDateString('fa'));
                        var bookTime = engDigit(new Date(flight.Scheduled).toLocaleTimeString('fa'));
                    }
                    
                    if (flight.Actual) {
                        var actualTime = engDigit(new Date(flight.Actual).toLocaleTimeString('fa'));
                    }
                    
                    if (flight.Remark) {
                        var remarkClass = flight.Remark.trim().toLowerCase().replace(/ /g, '');
                        
                        let planeUp = '<svg xmlns="http://www.w3.org/2000/svg" fill="#10c1ee" viewBox="0 0 640 512"><path d="M624 448H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h608c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM80.6 341.3c6.3 6.8 15.1 10.7 24.3 10.7l130.5-.2a65.6 65.6 0 0 0 29.6-7.1l291-147.7c26.7-13.6 50.7-32.9 67-58.3 18.3-28.5 20.3-49.1 13.1-63.7-7.2-14.6-24.7-25.3-58.3-27.5-29.9-1.9-59.5 5.9-86.3 19.5l-98.5 50-218.7-82.1a17.8 17.8 0 0 0 -18-1.1L90.6 67.3c-10.7 5.4-13.3 19.7-5.2 28.5l156.2 98.1-103.2 52.4-72.4-36.5a17.8 17.8 0 0 0 -16.1 0L9.9 230.2c-10.4 5.3-13.2 19.1-5.6 28.1l76.2 83z"/></svg>';
                        let planeDown = '<svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 640 512"><path d="M624 448H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h608c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM44.8 205.7l88.7 80a62.6 62.6 0 0 0 25.5 13.9l287.6 78.4c26.5 7.2 54.6 8.7 81 1.4 29.7-8.3 43.4-21.2 47.3-35.7 3.8-14.5-1.7-32.7-23.4-55-19.3-19.8-44.4-32.8-70.8-40l-97.5-26.6L282.8 30.2c-1.5-5.8-6-10.4-11.7-11.9L206.1 .6c-10.6-2.9-20.9 5.3-20.7 16.4l47.9 164.2-102.2-27.8-27.6-67.9c-1.9-4.9-6-8.6-11-9.9L52.7 64.8c-10.3-2.8-20.5 5-20.7 15.9l.2 101.8c.2 8.9 6 17.3 12.6 23.3z"/></svg>';
                        let planeSlash = '<svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 640 512"><path d="M32.5 147.9 64 256 32.5 364.1A16 16 0 0 0 48 384H88a16 16 0 0 0 12.8-6.4L144 320H246.9l-49 171.6A16 16 0 0 0 213.2 512h65.5a16 16 0 0 0 13.9-8.1l66.6-116.5L34.4 136.3A15.5 15.5 0 0 0 32.5 147.9zM633.8 458.1 455.1 320H512c35.3 0 96-28.7 96-64s-60.7-64-96-64H397.7L292.6 8.1C290.1 3.6 283.8 0 278.7 0H213.2a16 16 0 0 0 -15.4 20.4l36.9 129.3L45.5 3.4A16 16 0 0 0 23 6.2L3.4 31.5A16 16 0 0 0 6.2 53.9L594.5 508.6A16 16 0 0 0 617 505.8l19.6-25.3A16 16 0 0 0 633.8 458.1z"/></svg>';
                        
                        var flightIcon = {
                            'Arrived': planeDown,
                            'Departed': planeUp,
                            'On Time': planeUp,
                            'Delayed': planeUp,
                            'Remove': planeSlash
                        }
                        [flight.Remark];
                    }
                    
                    let flightCity = flight.Destination ? translate(flight.Destination) : (flight.From ? translate(flight.From) : '-');
                    let flightCityLabel = flight.Destination ? 'مبدا' : (flight.From ? 'مقصد': '-');
                    
                    const flightItem = $(`<li class="search-flight-item">
                                            <div class="search-flight-item-col" datetime="${flight.Scheduled}">
                                                <date class="search-flight-item-book-date">${bookDate || '-'}</date>
                                                <time class="search-flight-item-book-time">${bookTime || '-'}</time>
                                            </div>
                                            <div class="search-flight-item-col">
                                                <div class="search-flight-item-city">${flightCityLabel + ': ' + flightCity}</div>
                                                <bdi class="search-flight-item-number">${flight.FlyNumber || '-'}</bdi>
                                            </div>
                                            <div class="search-flight-item-col" datetime="${flight.Actual}">
                                                <time class="search-flight-item-actual-time">${actualTime || '-'}</time>
                                                <div class="search-flight-item-remark:${remarkClass}">${translate(flight.Remark) || '-'}</div>
                                            </div>
                                            <div class="search-flight-item-col">${flightIcon || ''}</div>
                                        </li>`);
                                    
                    // open flight detail modal
                    $(flightItem).on('click', function() {
    
                    const dom = `<div class="fligt-details-modal">
                                    <div class="uk-modal-header uk-flex uk-flex-space-between">
                                        <h2 class="uk-margin-remove">جزییات پرواز <bdi>${flight.FlyNumber || '-'}</bdi></h2>
                                        <a class="uk-modal-close uk-close"></a>
                                    </div>
                                    <div class="uk-modal-body uk-text-center">
                                        <table class="fligt-details-table uk-table uk-table-hover uk-table-striped uk-table-condensed">
                                          <tbody>
                                              <tr class="flight-modal-airline">
                                                  <td>هواپیمایی</td>
                                                  <td>${flyNumToAirLine(flight.FlyNumber) || '-'}</td>
                                              </tr>
                                              <tr class="flight-modal-terminal">
                                                  <td>ترمینال</td>
                                                  <td>${flight.terminal || '-'}</td>
                                              </tr>
                                              <tr class="flight-modal-flynumber">
                                                  <td>شماره پرواز</td>
                                                  <td><bdi>${flight.FlyNumber || '-'}</bdi></td>
                                              </tr>
                                              <tr class="flight-modal-city">
                                                  <td>${flightCityLabel}</td>
                                                  <td>${flightCity}</td>
                                              </tr>
                                              <tr class="flight-modal-date">
                                                  <td>تاریخ</td>
                                                  <td>${bookDate || '-'}</td>
                                              </tr>
                                              <tr class="flight-modal-book-time">
                                                  <td>طبق برنامه</td>
                                                  <td>${bookTime || '-'}</td>
                                              </tr>
                                              <tr class="flight-modal-actual-time">
                                                  <td>زمان واقعی</td>
                                                  <td>${actualTime || '-'}</td>
                                              </tr>
                                              <tr class="flight-modal-status">
                                                  <td>وضعیت پرواز</td>
                                                  <td>${flight.Status || '-'}</td>
                                              </tr>
                                          </tbody>
                                        </table>
                                    </div>
                                </div>`;
    
                        UIkit.modal.blockUI(dom, {
                            bgclose: true,
                            keyboard: true,
                            center: true,
                        });
                    });
                    
                    $('.search-flights-list', wrap).append(flightItem);
                });
            } // store data end
            
        }); // end wrap
        
        // translate english to persian -- (must be lowecase)
        function translate(word) {
            return {
                "france air": "ایر فرانس",
                "airline": "هواپیمایی",
                "terminal": "ترمینال",
                "flynumber": "شماره پرواز",
                "flightdescription": "وضعیت پرواز",
                "lastupdatedat": " بروزرسانی در ساعت",
                "hours": "ساعت",
                "emiratesdescription": "هواپیمایی امارات، شرکت هواپیمایی اماراتی است، که دفتر مرکزی آن در شهر دبی قرار دارد.",
                "departedremainingtime": "تا پرواز",
                "suitcase": "نقاله",
                "canceled": "لغو شده",
                "fromtimetotime": "از ساعت تا ساعت",
                "najaf": "نجف",
                "country": "کشور",
                "flightdetails": "جزییات پرواز",
                "airlinename": "نام هواپیمایی",
                "destination": "مقصد",
                "and": "و",
                "id": "شناسه",
                'arrived': 'رسید',
                'departed': 'پرواز کرد',
                'on time': 'به موقع',
                'delayed': 'با تاخیر',
                'remove': 'حذف شد',
                
                // airlines
                "air arabia": "ایر عربیا",
                "ata airlines": "آتا",
                "salam air": "سلام ایر",
                "kuwait airways": "کویت",
                "iranaseman": "ایران آسمان",
                "atlasglobal": "اطلس گلوبال",
                "iranairtour": "ایران ایرتور",
                "mahan air": "هواپیمایی ماهان",
                "iraqi airways": "هواپیمایی عراق",
                "qeshm airlines": "هواپیمایی قشم",
                "taban airlines": "هواپیمایی تابان",
                "emirates airline": "هواپیمایی امارات",
                "armenia air company": "شرکت هواپیمایی آرمنیا",
                
                // places
                "beijing": "پکن",
                "dusseldorf": "دوسلدورف",
                "jeddah": "جده",
                "sulaymaniyah": "سلیمانیه",
                "paris": "پاریس",
                "ankara": "آنکارا",
                "erbil": "اربیل",
                "shenzhen": "شنژن",
                "isparta": "اسپارتا",
                "united kingdom": "بریتانیا",
                "qatar": "قطر",
                "london": "لندن",
                "athens": "آتن",
                "british": "بریتیش ایرویز",
                "kualalumpur": "کوالالامپور",
                "belgrade": "بلگراد",
                "stockholm": "استکهلم",
                "baku": "باکو",
                "cham wings": "شام وینگز ایرلاینز",
                "tbilisi": "تفلیس",
                "brussels": "بروکسل",
                "cologne": "کلن",
                "naserieh": "نصیریه",
                "mumbai": "بمبئی",
                "frankfurt": "فرانکفورت",
                "vienna": "وین",
                "kiev": "کی یف",
                "yerevan": "ایروان",
                "kamair": "کام ایر",
                "moscow": "مسکو",
                "lufthansa": "لوفتانزا",
                "tashkent": "تاشکند",
                "muscat": "مسقط",
                "adena": "آدنا",
                "klm": "کی ال ام",
                "kuwait": "کویت",
                "dubai": "دبی",
                "iran": "ایران",
                "doha": "دوحه",
                "urumqi": "ارومچی",
                "jebel ali": "جبل علی",
                "cukurova": "کوکورووا",
                "dushanbe": "دوشنبه",
                "amsterdam": "آمستردام",
                "hamburg": "هامبورگ",
                "sharjah": "شارجه",
                "baghdad": "بغداد",
                "mazar-i-sharif": "مزار شریف",
                "izmir": "ازمیر",
                "tajikistan": "تاجیکستان",
                "oman": "عمان",
                "guang zhou": "گوانگ ژو",
                "shanghai": "شانگهای",
                "denizli": "دنیزلی",
                "rome": "رم",
                "france": "فرانسه",
                "pegasus": "پگاسوس",
                "varna": "وارنا",
                "caracas": "کاراکاس",
                "syria": "سوریه",
                "abu dhabi": "ابوظبی",
                "afghanistan": "افغانستان",
                "united arab emirates": "امارات متحده عربی",
                "karachi": "کراچی",
                "iraq": "عراق",
                "istanbul": "استانبول",
                "kabul": "کابل",
                "damascus": "دمشق",
                "bangkok": "بانکوک",
                "zagros": "زاگرس",
                "batumi": "باتومی",
                "istanbul-sabiha": "استانبول - صبیحه گوکچن",
                "barcelona": "بارسلونا",
                "gotheburg": "گوتنبورگ",
                "berlin": "برلین",
                "almaty": "آلماتی",
                "armenia": "ارمنستان",
                "milan": "میلان",
                "delhi": "دهلی"
            }[word.toLowerCase()] || word;
        }
        
        // convert fly number to air line
        function flyNumToAirLine(flyNumber) {
            if (flyNumber.length > 1) {
                return {
                    'W5': 'Mahan Air IRM',
                    'EK': 'Emirates Airline',
                    'G9': 'Air Arabia',
                    'HH': 'Taban Airlines',
                    'QB': 'Qeshm Airlines',
                    'SU': 'Aeroflot Russian Airlines',
                    'AZ': 'ALITALIA',
                    'OS': 'Austrian Airlines',
                    'ZV': 'Zagros Airlines',
                    'EY': 'Etihad Airways',
                    'VR': 'Varesh Airlines',
                    '3L': 'Etihad Airways',
                    'FG': 'Ariana Afghan Airlines',
                    'RQ': 'Kam Air',
                    'EP': 'Iran Aseman',
                    'J2': 'Azerbaijan Airlines',
                    'IR': 'Iran Air',
                    'IJ': 'Meraj Airlines',
                    'JI': 'Meraj Airlines',
                    'TW': 'Tailwind Airlines',
                    'TI': 'Tailwind Airlines',
                    'FZ': 'flydubai',
                    'QR': 'Qatar Airways',
                    'SQ': 'Singapore Airlines',
                    'OV': 'Salam Air',
                    'XQ': 'Sun Express',
                    'TK': 'Turkish Airlines',
                    'PS': 'Ukraine International Airlines',
                    'LH': 'Lufthansa',
                    'KL': 'KLM Royal Dutch Airlines',
                    'V0': 'Conviasa Airlines',
                    'PC': 'Pegasus Airlines',
                    'WY': 'Oman Air',
                    '3F': 'FlyOne Armenia Air',
                    'KK': 'AtlasGlobal',
                    'BA': 'British Airways',
                    'AF': 'Air France',
                    'IA': 'Iraqi Airways',
                    'I3': 'ATA Airlines',
                    'IV': 'Caspian Airlines',
                    'IS': 'Sepehran Airlines',
                    'IF': 'Fly Baghdad Airlines',
                    '7J': 'Tajik Air',
                    'KU': 'Kuwait Airways',
                    'A3': 'Aegean Airlines',
                    'Y9': 'Kish Air',
                    'SV': 'Saudi Arabian Airlines',
                    '6Q': 'Cham Wings Airlines',
                    'CZ': 'China Southern Airlines',
                    'G6': 'Fly Arena Airlines',
                    '6A': 'Armenia Airways',
                    'B9': 'Iran Airtour Airlines',
                    'FH': 'Freebird Airlines',
                    '4M': 'Mavi Gok Airlines',
                    'J9': 'Jazeera Airways K.S.C',
                    'D4': 'Georgian Wings Airlines',
                    '7H': 'Corendon Airlines',
                }[flyNumber.slice(0, 2)] || -1;
            }
        }
        
        // Convert Persian & Arabic digits to English
        function engDigit(str) {
            // convert persian digits [۰۱۲۳۴۵۶۷۸۹]
            var e = '۰'.charCodeAt(0);
            str = str.replace(/[۰-۹]/g, function(t) {
                return t.charCodeAt(0) - e;
            });
            
            // convert arabic indic digits [٠١٢٣٤٥٦٧٨٩]
            e = '٠'.charCodeAt(0);
            str = str.replace(/[٠-٩]/g, function(t) {
                return t.charCodeAt(0) - e;
            });
            return str;
        }
        
    } // mb fix end if
}();
