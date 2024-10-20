!function() {
    if (!window.mbFListScriptInited) { // FIX MODULE BUILDER RUN TWICE!!!
        window.mbFListScriptInited = true;
        
        $('.flist-wrap').each(function(_, wrap) {
            
            const incomingFlightsApiUrl = $('[data-dbfield=incomingFlightsApiUrl]', wrap).val();
            const outgoingFlightsApiUrl = $('[data-dbfield=outgoingFlightsApiUrl]', wrap).val();
            const airlinesLogosFolder = $('[data-dbfield=airlinesLogosFolder]', wrap).val();
            
            function startFetch() {
                // fetch incoming flight list
                if (incomingFlightsApiUrl) {
                    fetchData(incomingFlightsApiUrl, 'incoming');
                } else {
                    alert('آدرس وب سرویساشتباه است.');
                }
                
                // fetch outgoing flight list
                if (outgoingFlightsApiUrl) {
                    fetchData(outgoingFlightsApiUrl, 'outgoing');
                } else {
                    alert('آدرس وب سرویساشتباه است.');
                }
            }
            
            startFetch();
            
            // read search term from url query string
            const searchTerm = new URLSearchParams(window.location.search).get('term');
            if (searchTerm) {
                $('.flist-filter-search input', wrap).val(searchTerm);
            }
            
            $('.flist-update', wrap).on('click', function() {
                $('.flist-filter-search input', wrap).val('').change();
                $('.flist-filter-time input', wrap).val('').change();
                $('.flist-filter-flew input', wrap).prop('checked', false).change();
                $('.flist-filter-delayed input', wrap).prop('checked', false).change();
                
                startFetch();
            });
            
            // Function to apply all filters
            function applyFilters() {
                const keywordVal = $('.flist-filter-search input', wrap).val().toLowerCase();
                const timeRange = $('.flist-filter-time input', wrap).val().split('-').map(str => str.trim());
                const flewChecked = $('.flist-filter-flew input', wrap).is(':checked');
                const delayedChecked = $('.flist-filter-delayed input', wrap).is(':checked');
            
                $('.flist-list-item', wrap).each(function(_, item) {
                    const text = $(item).text().toLowerCase();
                    const time = $('.flist-item-book-time', item).text();
                    const remark = $('.flist-item-remark', item).text().toLowerCase();
            
                    // Check if item matches the keyword filter
                    const matchesKeyword = text.includes(keywordVal);
            
                    // Check if item matches the time filter
                    const matchesTime = (timeRange.length === 2) ? (toTime(time) >= toTime(timeRange[0]) && toTime(time) <= toTime(timeRange[1])) : true;
            
                    // Check if item matches the "flew" checkbox filter
                    const matchesFlew = !flewChecked || remark.includes('پرواز کرد');
            
                    // Check if item matches the "delayed" checkbox filter
                    const matchesDelayed = !delayedChecked || remark.includes('با تاخیر');
            
                    // Show item if it matches all filters
                    $(item).toggle(matchesKeyword && matchesTime && matchesFlew && matchesDelayed);
                });
            }
            
            // Trigger filters when keyword input changes
            $('.flist-filter-search input').on('keyup paste change', function() {
                applyFilters();
            });
            
            // Trigger filters when time input changes
            $('.flist-filter-time input', wrap).on('change', function() {
                applyFilters();
                
                $('.flist-filter-time-clear', wrap).toggle(this.value !== '');
            });
            
            // Trigger filters when "flew" checkbox changes
            $('.flist-filter-flew input', wrap).on('change', function() {
                applyFilters();
            });
            
            // Trigger filters when "delayed" checkbox changes
            $('.flist-filter-delayed input', wrap).on('change', function() {
                applyFilters();
            });
            
            // filter by time dropdown
            $('.flist-filter-time input', wrap).each(function(_, input) {
                
                function dateList(cls) {
                    return Array.from({ length: 24 }, (_, i) => 
                        `<li class="flist-filter-${cls}-time-item">${i.toString().padStart(2, '0')}:00</li>`
                    ).join('\n');
                }
                
                const dom = $(`<div class="flist-filter-time-list">
                                <ul class="flist-filter-start-time-list">\n${dateList('start')}\n</ul>
                                <ul class="flist-filter-end-time-list">\n${dateList('end')}\n</ul>
                            </div>`);
                            
                $(this).after(dom);
                
                let time = { start: '00:00', end: '23:00' }
                                             
                $(dom).each(function(wrap) {
            
                    ['start', 'end'].map(function(key) {
                        const compare = key == 'start' ? (a, b) => toTime(a) <= toTime(b) : (a, b) => toTime(a) >= toTime(b);
            
                        $(`.flist-filter-${key}-time-item`, wrap).on('click', function() {
                            let thisTime = this.textContent.trim();
                            if (compare(thisTime, time[key == 'start' ? 'end' : 'start'])) {
                                $(this).addClass('active');
                                $(this).siblings().removeClass('active');
                                time[key] = thisTime;
                            }
            
                            $(input).val(`${time.start} - ${time.end}`).change();
                        });
                    });
            
                });
            });
            
            // convert time string to time function
            function toTime(t) {
                return new Date(`1970-01-01T${t}`);
            }
            
            // get remaining time
            function getRemainingTime(targetTime) {
                // Get current time
                const now = new Date();
            
                // Parse target time (e.g., "13:44")
                const [targetHours, targetMinutes] = targetTime.split(":").map(Number);
            
                // Create a new Date object for the target time
                const target = new Date();
                target.setHours(targetHours, targetMinutes, 0, 0); // Set hours, minutes, seconds, milliseconds to 0
            
                // If the target time is earlier than the current time (on the same day), return false
                if (target <= now) {
                    return '-';
                }
            
                // Calculate the difference in milliseconds
                const remainingTimeMs = target - now;
            
                // Convert remaining time to hours and minutes
                const remainingHours = Math.floor(remainingTimeMs / (1000 * 60 * 60));
                const remainingMinutes = Math.floor((remainingTimeMs % (1000 * 60 * 60)) / (1000 * 60));
            
                return `${remainingHours ? remainingHours + ' ساعت و ' : ''} ${remainingMinutes} دقیقه`;
            }
            
            // clear time filter
            $('.flist-filter-time-clear', wrap).on('click', function() {
                $(this).hide();
                $('.flist-filter-time input', wrap).val('').change();
                $('.flist-filter-time-list .active', wrap).removeClass('active');
            });

            // API fetch
            function fetchData(url, type) {
                fetch(url)
                .then(res => {
                    if (!res.ok) {
                        console.error('Network response error.');
                        $(`.flist-${type}-list-wrap .flist-api-status-loading`, wrap).hide();
                        $(`.flist-${type}-list-wrap .flist-api-status-failed`, wrap).show();
                        
                    }
                    return res.json();
                })
                .then(data => {
                    $(`.flist-${type}-list-wrap .flist-api-status-loading`, wrap).hide();
                    
                    $('.flist-update span', wrap).text(function() {
                        const time = new Date();
                        const hours = time.getHours().toString().padStart(2, '0');
                        const minutes = time.getMinutes().toString().padStart(2, '0');
                        return `${hours}:${minutes}`;
                    });

                    // strore flight data in list
                    storeData(data, type);
                    
                })
                .catch(err => {
                    console.error(err);
                    $(`.flist-${type}-list-wrap .flist-api-status-loading`, wrap).hide();
                    $(`.flist-${type}-list-wrap .flist-api-status-failed`, wrap).show();
                    
                });
            }
            
            // stroe flight data in list
            function storeData(data, type) {
                
                var flightList = '';
                data.map(function(flight) {

                    if (flight.Scheduled) {
                        var bookDate = engDigit(new Date(flight.Scheduled).toLocaleDateString('fa'));
                        var bookTime = engDigit(new Date(flight.Scheduled).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }));
                    }
                    
                    if (flight.Actual) {
                        var realTime = engDigit(new Date(flight.Actual).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }));
                    }
                    
                    if (flight.FlyNumber) {
                        var airline = airlines.filter(x => x.FlyNumber == flight.FlyNumber.slice(0, 2))[0];
                    }
                    
                    let flightCity = flight.Destination ? translate(flight.Destination) : (flight.From ? translate(flight.From) : '-');
                    let flightCityLabel = flight.Destination ? 'مبدا' : (flight.From ? 'مقصد': '-');
                    
                    flightList += `<li class="flist-list-item">
                                            <div class="flist-list-item-col"
                                                data-uk-tooltip="{pos:'top', cls: 'flist-list-item-airline-details'}"
                                                title="
                                                    <img src='${airline ? airlinesLogosFolder + airline.Logo : ''}' onerror='this.remove()'>
                                                    <div><b>نام هواپیمایی</b>: ${airline ? airline.Name : '-'}</div>
                                                    <div><b>کشور</b>: ${airline ? airline.Country : '-'}</div>
                                                    <div><b>شناسه:</b> ${airline ? airline.Name : '-'}</div>
                                                ">
                                                
                                                <img src="${airline ? airlinesLogosFolder + airline.Logo : ''}" onerror="this.remove()">
                                                
                                            </div>
                                            <div class="flist-list-item-col"><bdi class="flist-item-flynumber">${flight.FlyNumber || '-'}</bdi></div>
                                            <div class="flist-list-item-col">
                                                <span class="flist-item-city">${flightCity || '-'}</span>
                                                <span hidden>${flight.From ? flight.From : flight.Destination}</span>
                                            </div>
                                            <div class="flist-list-item-col"><span class="flist-item-book-date">${bookDate || '-'}</span></div>
                                            <div class="flist-list-item-col"><span class="flist-item-book-time">${bookTime || '-'}</span></div>
                                            <div class="flist-list-item-col"><span class="flist-item-real-time">${realTime || '-'}</span></div>
                                            <div class="flist-list-item-col"><span class="flist-item-remark">${translate(flight.Remark) || '-'}</span></div>
                                            ${type == 'incoming' ? `<div class="flist-list-item-col"><span class="flist-item-belt">${flight.Belt ? flight.Belt : '-'}</span></div>` : ''}
                                            <div class="flist-list-item-col"><span class="flist-item-until-fly">${bookTime ? getRemainingTime(bookTime) : ''}</span></div>
                                        </li>`;
                });
                
                $('.flist-filter-search input', wrap).change();
                $(`.flist-${type}-list`, wrap).html(flightList);
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
        
        // ailine details
        var airlines = [
          {
            FlyNumber: 'W5',
            ID: 'Mahan Air',
            Name: 'Mahan Air IRM',
            Logo: 'Mahan.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'EK',
            ID: 'Emirates',
            Name: 'Emirates Airline',
            Logo: 'Emirates.webp',
            Country: 'United Arab Emirates'
          },
          {
            FlyNumber: 'G9',
            ID: 'AirArabia',
            Name: 'Air Arabia',
            Logo: 'airarabia.webp',
            Country: 'United Arab Emirates'
          },
          {
            FlyNumber: 'HH',
            ID: 'TabanAirlines',
            Name: 'Taban Airlines',
            Logo: 'tabanairline.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'QB',
            ID: 'Queshm Air',
            Name: 'Qeshm Airlines',
            Logo: 'Qeshm.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'SU',
            ID: 'Aeroflot',
            Name: 'Aeroflot Russian Airlines',
            Logo: 'Aeroflot.webp',
            Country: 'Russian Federation'
          },
          {
            FlyNumber: 'AZ',
            ID: 'Alitalia',
            Name: 'ALITALIA',
            Logo: 'Alitalia.webp',
            Country: 'Italy'
          },
          {
            FlyNumber: 'OS',
            ID: 'Austrian',
            Name: 'Austrian Airlines',
            Logo: 'Austrian.webp',
            Country: 'Austria'
          },
          {
            FlyNumber: 'ZV',
            ID: 'Zagros',
            Name: 'Zagros Airlines',
            Logo: 'Zagros.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'EY',
            ID: 'Etihad',
            Name: 'Etihad Airways',
            Logo: 'EY.webp',
            Country: 'United Arab Emirates'
          },
          {
            FlyNumber: 'VR',
            ID: 'Varesh',
            Name: 'Varesh Airlines',
            Logo: 'VR.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: '3L',
            ID: 'Etihad',
            Name: 'Etihad Airways',
            Logo: 'EY.webp',
            Country: 'United Arab Emirates'
          },
          {
            FlyNumber: 'FG',
            ID: 'Ariana Afghan',
            Name: 'Ariana Afghan Airlines',
            Logo: 'FG.webp',
            Country: 'Afghanistan'
          },
          {
            FlyNumber: 'RQ',
            ID: 'KamAir',
            Name: 'Kam Air',
            Logo: 'kamair.webp',
            Country: 'Afghanistan'
          },
          {
            FlyNumber: 'EP',
            ID: 'IranAseman',
            Name: 'Iran Aseman',
            Logo: 'aseman.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'J2',
            ID: 'AZAL',
            Name: 'Azerbaijan Airlines',
            Logo: 'Azerbaijan.webp',
            Country: 'Azerbaijan'
          },
          {
            FlyNumber: 'IR',
            ID: 'Iranair',
            Name: 'Iran Air',
            Logo: 'IranAir.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'IJ',
            ID: 'MERAJ',
            Name: 'Meraj Airlines',
            Logo: 'Meraj.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'JI',
            ID: 'MERAJ',
            Name: 'Meraj Airlines',
            Logo: 'Meraj.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'TW',
            ID: 'Tailwind Airlines',
            Name: 'Tailwind Airlines',
            Logo: 'TW.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'TI',
            ID: 'Tailwind',
            Name: 'Tailwind Airlines',
            Logo: 'TW.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'FZ',
            ID: 'flydubai',
            Name: 'flydubai',
            Logo: 'flydubai.webp',
            Country: 'UAE'
          },
          {
            FlyNumber: 'QR',
            ID: 'Qatari',
            Name: 'Qatar Airways',
            Logo: 'Qatar.webp',
            Country: 'Qatar'
          },
          {
            FlyNumber: 'SQ',
            ID: 'Singapore',
            Name: 'Singapore Airlines',
            Logo: 'Singapor.webp',
            Country: 'Singapore'
          },
          {
            FlyNumber: 'OV',
            ID: 'SalamAir',
            Name: 'Salam Air',
            Logo: 'SalamAir.webp',
            Country: 'Oman'
          },
          {
            FlyNumber: 'XQ',
            ID: 'Sun Express',
            Name: 'Sun Express',
            Logo: 'SunExpress.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'TK',
            ID: 'Turkish',
            Name: 'Turkish Airlines',
            Logo: 'Turkish.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'PS',
            ID: 'Ukraine International',
            Name: 'Ukraine International Airlines',
            Logo: 'UIA.webp',
            Country: 'Ukraine'
          },
          {
            FlyNumber: 'LH',
            ID: 'Lufthansa',
            Name: 'Lufthansa',
            Logo: 'Lufthansa.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'KL',
            ID: 'KLM',
            Name: 'KLM Royal Dutch Airlines',
            Logo: 'Amsterdam.webp',
            Country: 'Amsterdam'
          },
          {
            FlyNumber: 'V0197',
            ID: 'Conviasa',
            Name: 'Conviasa Airlines',
            Logo: 'Conviasa.webp',
            Country: 'Venezuela'
          },
          {
            FlyNumber: 'PC',
            ID: 'Pegasus',
            Name: 'Pegasus Airlines',
            Logo: 'Pegasus.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'WY',
            ID: 'Oman',
            Name: 'Oman Air',
            Logo: 'Oman.webp',
            Country: 'Oman'
          },
          {
            FlyNumber: '3F',
            ID: 'FlyOne',
            Name: 'FlyOne Armenia Air',
            Logo: '3F.webp',
            Country: 'Armenia'
          },
          {
            FlyNumber: 'KK',
            ID: 'Atlas',
            Name: 'AtlasGlobal',
            Logo: 'Atlas.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'KK',
            ID: 'Atlas',
            Name: 'AtlasGlobal',
            Logo: 'Atlas.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'BA',
            ID: 'British',
            Name: 'British Airways',
            Logo: 'British.webp',
            Country: 'United Kingdom'
          },
          {
            FlyNumber: 'AF',
            ID: 'France',
            Name: 'Air France',
            Logo: 'France.webp',
            Country: 'France'
          },
          {
            FlyNumber: 'IA',
            ID: 'Iraqi',
            Name: 'Iraqi Airways',
            Logo: 'Iraqi.webp',
            Country: 'Iraqi'
          },
          {
            FlyNumber: 'I3',
            ID: 'ATA',
            Name: 'ATA Airlines',
            Logo: 'ATA.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'IV',
            ID: 'Caspian',
            Name: 'Caspian Airlines',
            Logo: 'IV.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'IS',
            ID: 'Sepehran',
            Name: 'Sepehran Airlines',
            Logo: 'IS.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'IF',
            ID: 'Fly Baghdad',
            Name: 'Fly Baghdad Airlines',
            Logo: 'IF.webp',
            Country: 'Iraq'
          },
          {
            FlyNumber: '7J',
            ID: 'Tajik',
            Name: 'Tajik Air',
            Logo: 'Tajik.webp',
            Country: 'Tajikistan'
          },
          {
            FlyNumber: 'KU',
            ID: 'Kuwait',
            Name: 'Kuwait Airways',
            Logo: 'Kuwait.webp',
            Country: 'Kuwait'
          },
          {
            FlyNumber: 'A3',
            ID: 'Aegean',
            Name: 'Aegean Airlines',
            Logo: 'Aegean.webp',
            Country: 'Athens'
          },
          {
            FlyNumber: 'SV',
            ID: 'Saudia',
            Name: 'Saudia',
            Logo: 'Saudi.webp',
            Country: 'Saudi'
          },
          {
            FlyNumber: 'Y9',
            ID: 'Kish',
            Name: 'Kish Air',
            Logo: 'Kish.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'SV',
            ID: 'Saudi',
            Name: 'Saudi Arabian Airlines',
            Logo: 'Saudi.webp',
            Country: 'Saudi'
          },
          {
            FlyNumber: '6Q',
            ID: 'Cham Wings',
            Name: 'Cham Wings Airlines',
            Logo: 'Cham-Wings.webp',
            Country: 'Syria'
          },
          {
            FlyNumber: 'CZ',
            ID: 'China',
            Name: 'China Southern Airlines',
            Logo: 'China.webp',
            Country: 'China'
          },
          {
            FlyNumber: 'SV',
            ID: 'Saudi',
            Name: 'Saudi Arabian Airlines',
            Logo: 'Saudi.webp',
            Country: 'Saudi'
          },
          {
            FlyNumber: 'IS',
            ID: 'Fly Sepehran',
            Name: 'Fly Sepehran Airlines',
            Logo: 'IS.webp',
            Country: 'IRAN'
          },
          {
            FlyNumber: 'G6',
            ID: 'Fly Arena',
            Name: 'Fly Arena Airlines',
            Logo: 'G6.webp',
            Country: 'Armenia'
          },
          {
            FlyNumber: '6A',
            ID: 'Armenia',
            Name: 'Armenia Airways',
            Logo: '6A.webp',
            Country: 'Armenia'
          },
          {
            FlyNumber: 'B9',
            ID: 'Iran Airtour',
            Name: 'Iran Airtour Airlines',
            Logo: 'B9.webp',
            Country: 'Iran'
          },
          {
            FlyNumber: 'FH',
            ID: 'Freebird',
            Name: 'Freebird Airlines',
            Logo: 'FH.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: '4M',
            ID: 'Mavi Gok',
            Name: 'Mavi Gok Airlines',
            Logo: '4M.webp',
            Country: 'Turkey'
          },
          {
            FlyNumber: 'J9',
            ID: 'Jazeera',
            Name: 'Jazeera Airways K.S.C',
            Logo: 'J9.webp',
            Country: 'Kuwait'
          },
          {
            FlyNumber: 'D4',
            ID: 'Georgian Wings',
            Name: 'Georgian Wings Airlines',
            Logo: 'D4.webp',
            Country: 'Georgia'
          },
          {
            FlyNumber: '7H',
            ID: 'XC/CAI',
            Name: 'Corendon Airlines',
            Logo: '7H.webp',
            Country: 'Netherland'
          }
        ];

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
