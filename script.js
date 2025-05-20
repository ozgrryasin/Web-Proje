// Sayfa yüklendiğinde ana sayfayı göster
window.addEventListener('DOMContentLoaded', () => {
    loadHomepageContent();
    setupCategoryDropdown();
    
    // Event listener'ları ekle
    document.getElementById('showMovies').addEventListener('click', (e) => {
        e.preventDefault();
        loadAllMovies();
    });
    
    document.getElementById('showSeries').addEventListener('click', (e) => {
        e.preventDefault();
        loadAllSeries();
    });
    
    // Footer bağlantıları için event listener'lar
    document.getElementById('footer-movies').addEventListener('click', (e) => {
        e.preventDefault();
        loadAllMovies();
    });
    
    document.getElementById('footer-series').addEventListener('click', (e) => {
        e.preventDefault();
        loadAllSeries();
    });
    
    // Footer statik sayfaları için event listener'lar
    const footerLinks = document.querySelectorAll('footer a:not([id])');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const text = link.textContent.trim().toLowerCase();
            
            // Hangi sayfayı açacağımızı belirle
            if (text === 'yardım merkezi') {
                loadStaticPage('helpCenter');
            } else if (text === 'iletişim formu') {
                loadStaticPage('contactForm');
            } else if (text === 'gizlilik politikası') {
                loadStaticPage('privacyPolicy');
            } else if (text === 'koşullar ve şartlar') {
                loadStaticPage('termsConditions');
            } else if (text === 'hakkımızda') {
                loadStaticPage('aboutUs');
            } else if (text === 'kategoriler') {
                // Ana sayfaya dön ve kategorileri göster
                loadHomepageContent();
            } else if (text === 'ana sayfa') {
                loadHomepageContent();
            }
        });
    });
    
    // Kategori filtresi için event listener
    categoryFilter.addEventListener('change', () => {
        const category = categoryFilter.value;
        
        if (filteredTitle.textContent === 'Tüm Filmler') {
            loadAllMovies(category);
        } else if (filteredTitle.textContent === 'Tüm Diziler') {
            loadAllSeries(category);
        }
    });
    
    // Arama kutusu için event listener
    searchInput.addEventListener('input', () => {
        performSearch(searchInput.value);
    });
    
    // Arama sonuçları dışında bir yere tıklandığında sonuçları gizle
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Geri dönme butonu için event listener
    backButton.addEventListener('click', goBack);
});// Arama fonksiyonu
function performSearch(query) {
    query = query.toLowerCase().trim();
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
        return;
    }
    
    const results = [];
    
    // Filmlerde ara
    contentDatabase.movies.forEach(movie => {
        if (movie.title.toLowerCase().includes(query)) {
            results.push({...movie, type: 'movie'});
        }
    });
    
    // Dizilerde ara
    contentDatabase.series.forEach(series => {
        if (series.title.toLowerCase().includes(query)) {
            results.push({...series, type: 'series'});
        }
    });
    
    // Sonuçları göster
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-item">Sonuç bulunamadı.</div>';
    } else {
        results.forEach(result => {
            const searchItem = document.createElement('div');
            searchItem.className = 'search-item';
            searchItem.innerHTML = `
                <div class="search-item-image">
                    <img src="${result.image}" alt="${result.title}" onerror="this.src='https://via.placeholder.com/40x55?text=Yok'; this.onerror='';">
                </div>
                <div class="search-item-info">
                    <h4>${result.title}</h4>
                    <p>${result.type === 'movie' ? 'Film' : 'Dizi'}</p>
                </div>
            `;
            
            searchItem.addEventListener('click', () => {
                showDetailPage(result, result.type);
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                searchInput.value = '';
            });
            
            searchResults.appendChild(searchItem);
        });
    }
    
    searchResults.classList.add('active');
}

// Kategori dropdown'ını oluştur
function setupCategoryDropdown() {
    const categoryDropdown = document.getElementById('categoryDropdown');
    
    // Event listener'ları ekle
    const categoryLinks = categoryDropdown.querySelectorAll('a');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            
            // Şu anki ekranı kontrol et
            const currentView = sessionStorage.getItem('lastViewedType');
            if (currentView === 'allMovies' || filteredTitle.textContent === 'Tüm Filmler') {
                loadAllMovies(category);
            } else if (currentView === 'allSeries' || filteredTitle.textContent === 'Tüm Diziler') {
                loadAllSeries(category);
            } else {
                // Varsayılan olarak filmleri göster
                loadAllMovies(category);
            }
        });
    });
}// Geri dönme fonksiyonu
function goBack() {
    // YouTube iframe'i temizle
    document.getElementById('youtube-frame').src = '';
    
    // Önceki sayfalara veya ana sayfaya dön
    const lastViewedType = sessionStorage.getItem('lastViewedType');
    
    hideAllContentSections();
    
    if (pageContainer) {
        // Statik sayfadan geri dönüş
        loadHomepageContent();
    } else if (lastViewedType === 'allMovies') {
        loadAllMovies();
    } else if (lastViewedType === 'allSeries') {
        loadAllSeries();
    } else {
        // Geçmiş bilgisi yoksa ana sayfaya dön
        loadHomepageContent();
    }
}

// Statik sayfa içeriği yükleme fonksiyonu

// Statik sayfa içeriği yükleme fonksiyonu
function loadStaticPage(pageKey) {
    // Önce tüm içerikleri gizle
    hideAllContentSections();
    
    // Sayfa verisini al
    const pageData = contentDatabase.pages[pageKey];
    if (!pageData) {
        console.error(`Sayfa verisi bulunamadı: ${pageKey}`);
        return;
    }
    
    // Yeni sayfa konteynerı oluştur
    pageContainer = document.createElement('div');
    pageContainer.className = 'static-page-container';
    pageContainer.innerHTML = `
        <div class="page-header">
            <button id="page-back-button" class="btn-back">← Geri Dön</button>
            <h1>${pageData.title}</h1>
        </div>
        <div class="page-content">
            ${pageData.content}
        </div>
    `;
    
    // Sayfa ekle
    contentContainer.appendChild(pageContainer);
    
    // Geri butonu için event listener ekle
    document.getElementById('page-back-button').addEventListener('click', goBack);
    
    // Sayfa içindeki içerik bağlantılarına event listener ekle
    const contentLinks = pageContainer.querySelectorAll('.content-link');
    contentLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            if (targetPage) {
                loadStaticPage(targetPage);
            }
        });
    });
    
    // İletişim formu için olay dinleyicisi
    const contactForm = pageContainer.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Form verilerini al
            const name = contactForm.querySelector('#name').value;
            const email = contactForm.querySelector('#email').value;
            const subject = contactForm.querySelector('#subject').value;
            const message = contactForm.querySelector('#message').value;
            
            // Basit doğrulama
            if (!name || !email || !subject || !message) {
                alert('Lütfen tüm alanları doldurun.');
                return;
            }
            
            // Gönderim işlemi (örneğin, bir API çağrısı yapılabilir)
            console.log('İletişim Formu Gönderildi:', { name, email, subject, message });
            
            // Başarı mesajı göster
            alert('Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.');
            
            // Formu sıfırla
            contactForm.reset();
        });
    }
    
    // Sayfa başına scroll
    window.scrollTo(0, 0);
}
// Film ve dizi veritabanı
const contentDatabase = {
    // Mevcut filmler
    movies: [
        {
            id: "m1",
            title: "Yüzüklerin Efendisi: Kralın Dönüşü",
            year: "2003",
            categories: ["Fantastik", "Macera"],
            description: "Karanlığın bütün güçleri son savaş için bir araya gelirken Gandalf, Gondor'un yaralı ordusunu toparlamak için hazırlıklara başlar. Thoden, tarihin bu en büyük savaşı için tüm savaşçılarını seferber eder. İçlerinde saklanan Eowyn ve Merry ile birlikte insanlar, tüm cesaretlerine rağmen Gondor'u kuşatan düşmanlar karşısında güçsüzdür. Yinede Yüzük Taşıyıcısı'nın yolculuğunu tamamlamasini için hayatlarının en zor savaşında birbirlerine kenetlenirler.",
            rating: "9.0",
            image: "https://media.themoviedb.org/t/p/w600_and_h900_bestv2/qwigzi0gOcXZRxbm488wT31t2UZ.jpg",
            trailerUrl: "https://www.youtube.com/embed/r5X-hFf6Bwo",
            director: "Peter Jackson",
            duration: "201 dakika",
            cast: [
                { name: "Elijah Wood", character: "Frodo Baggins", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/7UKRbJBNG7mxBl2QQc5XsAh6F8B.jpg" },
                { name: "Viggo Mortensen", character: "Aragorn", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/vH5gVSpHAMhDaFWfh0Q7BG61O1y.jpg  " },
                { name: "Ian McKellen", character: "Gandalf", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/5cnnnpnJG6TiYUSS7qgJheUZgnv.jpg" }
            ]
        },
        {
            id: "m2",
            title: "Deadpool",
            year: "2016",
            categories: ["Aksiyon", "Komedi"],
            description: "Eski bir özel kuvvetler görevlisi olan Wade Wilson ordudan ayrıldıktan sonra kendi çöplüğünde, kendi kurallarına göre takılan, kötünün iyisi bir adamdır. Hayatına yeni giren Vanessa ile harika bir uyumu varken, bir şeylerin tam da yolunda gittiğini düşünürken kanser olduğu gerçeğiyle yüz yüze kalır. Sevdiği kadını bu acılı süreci izlemekten kurtarmak için onu terk eden Wade, kendisine tedavi umudu sunan bir bilimsel projeye katılır. Fakat bu proje sadece bir yan etki olarak kansere tedavi olacaktır. Asıl amaç birtakım DNA'ları tetiklemektir. Akla gelmeyecek acılara göğüs geren Wade, her şey sona erdiğinde üstün yeteneklere sahip olur. Fakat tüm bu özellikleriyle tek bir amacı vardır: Ajax Francis'ten intikam almak!",
            rating: "8.0",
            image: "https://image.tmdb.org/t/p/original/lOQxPHzDlhVIU7stIzVjI0AuwPP.jpg",
            trailerUrl: "https://www.youtube.com/embed/Xithigfg7dA",
            director: "Tim Miller",
            duration: "108 dakika",
            cast: [
                { name: "Ryan Reynolds", character: "Wade Wilson / Deadpool", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/4SYTH5FdB0dAORV98Nwg3llgVnY.jpg" },
                { name: "Morena Baccarin", character: "Vanessa", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/Hiv9zroKS0LhjAbKFQoz0BpzCe.jpg" },
                { name: "Ed Skrein", character: "Ajax", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/AaMTvZkroI8uo5JXQiJ5pSLEgSJ.jpg" }
            ]
        },
        {
            id: "m3",
            title: "Inception",
            year: "2010",
            categories: ["Bilim Kurgu", "Aksiyon"],
            description: "Leonardo DiCaprio bu yapımda, çok yetenekli bir hırsız olan Dom Cobb ile karşımızda. Uzmanlık alanı, zihnin en karanlık ve savunmasız olduğu rüya anında, bilinçaltının derinliklerindeki değerli sırları çekip çıkarmak ve onları çalmaktır. Cobb'un insanlarda nadiren görülebilecek bu yeteneği onu kurumsal casusluğun tehlikeli yeni dünyasında aranan bir oyuncu yapmıştır. Aynı zamanda bu durum onu uluslararası bir kaçak yapmış ve sevdiği her şeye malolmuştur. Cobb'a içinde bulunduğu durumdan kurtulmasını sağlayacak bir fırsat sunulur. Ona hayatını geri verebilecek son bir iş; tabii eğer imkansız 'Başlangıç'ı tamamlayabilirse.",
            rating: "8.8",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
            trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
            director: "Christopher Nolan",
            duration: "148 dakika",
            cast: [
                { name: "Leonardo DiCaprio", character: "Dom Cobb", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
                { name: "Joseph Gordon-Levitt", character: "Arthur", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/4U9G4YwTlIEbAymBaseltS38eH4.jpg" },
                { name: "Ken Watanabe", character: "Saito", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/w2t30L5Cmr34myAaUobLoSgsLfS.jpg" }
            ]
        },
        {
            id: "m4",
            title: "Interstellar",
            year: "2014",
            categories: ["Bilim Kurgu", "Dram"],
            description: "Dünya'nın giderek yaşanmaz hale gelmesiyle başlayan tarım krizi ve doğal felaketler, insanları yok olma tehlikesiyle karşı karşıya bırakmıştır. Teknik bilgisi ve becerisi yüksek olan Cooper, geniş mısır tarlalarında çiftçilik yaparak geçinmektedir; amacı iki çocuğuna güvenli bir hayat sunmaktır. Onlarla yaşayan büyük baba Donald çocuklara göz kulak olurken, henüz 10 yaşındaki kızı Murph şaşırtıcı bir zekaya sahiptir. Geçmişte bıraktığı bilim insanı kariyerini özleyen Cooper'un karşısına bir gün beklenmedik bir teklif çıkar ve ailesinin, dahası insanlığın güvenliği için zorlu bir karar alması gerekir...",
            rating: "8.7",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
            director: "Christopher Nolan",
            duration: "169 dakika",
            cast: [
                { name: "Matthew McConaughey", character: "Cooper", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/lCySuYjhXix3FzQdS4oceDDrXKI.jpg" },
                { name: "Anne Hathaway", character: "Dr. Amelia Brand", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/s6tflSD20MGz04ZR2R1lZvhmC4Y.jpg" },
                { name: "Jessica Chastain", character: "Murphy Cooper", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/lodMzLKSdrPcBry6TdoDsMN3Vge.jpg" }
            ]
        },
        {
            id: "m5",
            title: "Joker",
            year: "2019",
            categories: ["Aksiyon", "Suç"],
            description: "Joker, başarısız bir komedyen olan Arthur Fleck'in hayatına odaklanıyor. Toplum tarafından dışlanan bir adam olan Arthur, hayatta yapayalnızdır. Sürekli bir bağ kurma arayışında olan Arthur, yaşamını taktığı iki maske ile geçirir. Gündüzleri, geçimini sağlamak için palyaço maskesini yüzüne takan Arthur, geceleri ise asla üzerinden silip atamayacağı bir maske takar. Babasız büyüyen Arthur’u en yakın arkadaşı olan annesi Happy adıyla çağırır. Bu lakap, Arthur’un içindeki acıyı gizlemesine yardımcı olur. Ancak maruz kaldığı zorbalıklar, onun gitgide toluma aykırı bir adam haline gelmesine neden olur. Yavaş yavaş psikolojik olarak tekinsiz sulara yelken açılan Arthur, bir süre sonra kendisini Gotham Şehri’nde suç ve kaosun içinde bulur. Arthur, zamanla kendi kimliğinden uzaklaşıp Joker karakterine bürünür.",
            rating: "9.0",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
            trailerUrl: "https://www.youtube.com/embed/zAGVQLHvwOY",
            director: "Todd Phillips",
            duration: "122 dakika",
            cast: [
                { name: "Joaquin Phoenix", character: "Arthur Fleck / Joker", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/u38k3hQBDwNX0VA22aQceDp9Iyv.jpg" },
                { name: "Robert De Niro", character: "Murray Franklin", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/cT8htcckIuyI1Lqwt1CvD02ynTh.jpg" },
                { name: "Zazie Beetz", character: "Sophie Dumond", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/sgxzT54GnvgeMnOZgpQQx9csAdd.jpg" }
            ]
        },
        {
            id: "m6",
            title: "Matrix",
            year: "1999",
            categories: ["Bilim Kurgu", "Aksiyon"],
            description: "Bir bilgisayar programcısı olan Thomas Anderson aynı zamanda Neo nickname'li çok usta bir hacker dır. Ancak siyah takım elbiseli ve gözlüklü adamların yakın takibindedir. Bu takibin nedenini ise karşılaşacağı Morpheus'dan öğrenecektir. Neo, birden kendini Morpheus'un anlattıklarına güvenmek zorunda kaldığı büyük bir komplonun içinde bulacaktır. İçinde yaşadığımızı sandığımız bu dünya tamamiyle aldatıcıdır. Tüm insanlık aslında uzaydan gelen yaratıkların köleleridir. Neo, Trinity ve Morpheus'un da yardımıyla kendilerini bu düzeni yıkmaya adayan bir grubun içine katılır.",
            rating: "8.7",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
            trailerUrl: "https://www.youtube.com/embed/vKQi3bBA1y8",
            director: "Lana Wachowski, Lilly Wachowski",
            duration: "136 dakika",
            cast: [
                { name: "Keanu Reeves", character: "Neo", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/rRdru6REr9i3WIHv2mntpcgxnoY.jpg" },
                { name: "Laurence Fishburne", character: "Morpheus", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/8suOhUmPbfKqDQ17jQ1Gy0mI3P4.jpg" },
                { name: "Carrie-Anne Moss", character: "Trinity", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/xD4jTA3KmVp5Rq3aHcymL9DUGjD.jpg" }
            ]
        },
        {
            id: "m7",
            title: "The Dark Knight",
            year: "2008",
            categories: ["Aksiyon", "Suç"],
            description: "Batman, Teğmen Jim Gordon ve Bölge Savcısı Harvey Dent’in yardımlarıyla, şehir sokaklarını sarmış olan suç örgütlerinden geriye kalanları temizlemeye girişir. Bu ortaklığın etkili olduğu açıktır, ama ekip kısa süre sonra kendilerini, Joker olarak bilinen ve Gotham şehri sakinlerini daha önce de dehşete boğmuş olan suç dehasının yarattığı karmaşanın ortasında bulurlar.",
            rating: "9.0",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            trailerUrl: "https://www.youtube.com/embed/EXeTwQWrcwY",
            director: "Christopher Nolan",
            duration: "152 dakika",
            cast: [
                { name: "Christian Bale", character: "Bruce Wayne / Batman", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/qCpZn2e3dimwbryLnqxZuI88PTi.jpg" },
                { name: "Heath Ledger", character: "Joker", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/5Y9HnYYa9jF4NunY9lSgJGjSe8E.jpg" },
                { name: "Aaron Eckhart", character: "Harvey Dent / Two Face", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/u5JjnRMr9zKEVvOP7k3F6gdcwT6.jpg" }
            ]
        },
        {
            id: "m8",
            title: "Fight Club",
            year: "1999",
            categories: ["Dram", "Suç"],
            description: "Depresyonla mücadele eden ve uykusuzluk çeken bir adam, Tyler Durden isimli tuhaf bir sabun tüccarıyla tanışır. Sıkışmış hayatlarından kaçış arayan iki adam, bir yeraltı dövüş kulübünde öfkelerini boşaltır. Araları, Marla isimli bir kadın Tyler’ın dikkatini çekince bozulur.",
            rating: "8.8",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
            trailerUrl: "https://www.youtube.com/embed/qtRKdVHc-cE",
            director: "David Fincher",
            duration: "139 dakika",
            cast: [
                { name: "Brad Pitt", character: "Tyler Durden", image: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSU5vacDEoYu-ZEjGSg-7scAlQaRGZxD0k_wUPTYbvdEWARrJ18wNYg4tNaJO4v7-1oEdN_5rK9sxgcnci2K9lkMw  " },
                { name: "Edward Norton", character: "Narrator", image: "https://images.hellomagazine.com/horizon/square/453850f68ae5-edward-norton.jpg" },
                { name: "Helena Bonham Carter", character: "Marla Singer", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/hJMbNSPJ2PCahsP3rNEU39C8GWU.jpg" }
            ]
        },
        {
            id: "m9",
            title: "Pulp Fiction",
            year: "1994",
            categories: ["Suç", "Dram"],
            description: "Jules Winnfield ve Vincent Vega, mafya babası patronları Marsellus Wallace’tan çalınan bir çantayı geri almaya giden iki profesyonel tetikçidir. Wallace aynı zamanda Vincent’a, kendisi birkaç gün sonra şehir dışındayken karısını dışarı çıkarmasını söyler. Butch Coolidge, bir sonraki maçını kaybetmesi için Wallace’tan para alan yaşlı bir boksördür. Honey Bunny ve Pumpkin, yer değişikliğine ihtiyaçları olduğuna karar veren soyguncu bir çifttir. Görünüşte birbirleriyle alakası olmayan bu insanların hayatları, hem heyecanlı hem de eğlendirici bir sinema filmi macerasında nefes kesici bir şekilde birleşecektir.",
            rating: "8.9",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
            trailerUrl: "https://www.youtube.com/embed/s7EdQ4FqbhY",
            director: "Quentin Tarantino",
            duration: "154 dakika",
            cast: [
                { name: "John Travolta", character: "Vincent Vega", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/ap8eEYfBKTLixmVVpRlq4NslDD5.jpg" },
                { name: "Samuel L. Jackson", character: "Jules Winnfield", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/mXN4Gw9tZJVKrLJHde2IcUHmV3P.jpg" },
                { name: "Uma Thurman", character: "Mia Wallace", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/lg04iEqT6TC40H1jz10Z99OFMXx.jpg" }
            ]
        }
        
        // Diğer filmler (m4-m9) buraya - mevcut koddan korunacak
    ],
    
    // Mevcut Diziler
    series: [
        {
            id: "s1",
            title: "Friends",
            year: "1994-2004",
            categories: ["Komedi", "Romantik"],
            description: "Rachel, Monica, Phoebe, Ross, Chandler ve Joey, hem komik hem duygusal anlarla dolu dostluklarını sürdürürken, kariyerleri, aşk hayatları ve aileleriyle başa çıkmaya çalışır. Dizinin ana teması, arkadaşlığın ve birlikte geçirilen anların önemini vurgularken, eğlenceli diyalogları ve unutulmaz sahneleriyle izleyicileri yıllarca ekrana bağlamıştır.",
            rating: "8.9",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/f496cm9enuEsZkSPzCwnTESEK5s.jpg",
            trailerUrl: "https://www.youtube.com/embed/PFcCyf39Ozs",
            creator: "David Crane, Marta Kauffman",
            seasons: "10 sezon",
            cast: [
                { name: "Jennifer Aniston", character: "Rachel Green", image: "https://media.themoviedb.org/t/p/w138_and_h175_bestv2/qPXG41rYdUGldZhMhuZFvmpZKRp.jpg" },
                { name: "Matt LeBlanc", character: "Joey Tribbiani", image: "https://media.themoviedb.org/t/p/w138_and_h175_bestv2/a7Fl1sLUq1UDJ4pHsnwpBdEiDEZ.jpg" },
                { name: "Matthew Perry", character: "Chandler Bing", image: "https://media.themoviedb.org/t/p/w138_and_h175_bestv2/ecDzkLWPV1z0x31I1GTjNmLxAHk.jpg" }
            ]
        },
        {
            id: "s2",
            title: "Breaking Bad",
            year: "2008-2013",
            categories: ["Suç", "Dram"],
            description: "Kanser teşhisi konan kimya öğretmeni Walter White, ailesinin geleceğini güvence altına almak amacıyla metamfetamin üretmeye başlar. Zamanla suç dünyasında tehlikeli bir figür haline gelir ve eski öğrencisi Jesse Pinkman ile birlikte işler büyür.",
            rating: "9.5",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
            trailerUrl: "https://www.youtube.com/embed/HhesaQXLuRY",
            creator: "Vince Gilligan",
            seasons: "5 sezon",
            cast: [
                { name: "Bryan Cranston", character: "Walter White", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/7Jahy5LZX2Fo8fGJltMreAI49hC.jpg" },
                { name: "Aaron Paul", character: "Jesse Pinkman", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/8Ac9uuoYwZoYVAIJfRLzzLsGGJn.jpg" },
                { name: "Dean Norris", character: "Hank Schrader", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/c2ZYssB39msGwl0j7cJ9J4ztrnx.jpg" }
            ]
        },
        {
            id: "s3",
            title: "Behzat Ç.",
            year: " 2010–2014",
            categories: ["Polisiye", "Suç"],
            description: "Behzat Ç (Erdal Beşikçioğlu), 1985 yılında Polis Akademisi'nden mezun olmuş, cinayet bürosunda görev yapmakta olan bir polistir. Hizmet verdiği süre içerisinde almış olduğu cezalar nedeni ile hep başkomiser olarak kalmıştır. Behzat'ın eski eşi ile yaşadığı problemler kızına karşı ilgisiz kalmasına sebep olur. Bir süre sonra kızı Berna (Hazal Kaya) intihar eder. Behzat, bu olaydan sonra yıkılır. Behzat Ç. ve ekibinde yer alan polisler Harun (Fatih Artman), Hayalet (İnanç Konukçu), Akbaba (Berkan Şal), Eda (Seda Bakan), Selim (Hakan Hatipoğlu) ve Cevdet (Berke Üzrek), sezon boyunca bir yandan Behzat'ın kızının ölümü ile ilgili olabilecek kişiler ile ilişki kurarken, bir yandan da her bir bölümde yaşanan farklı cinayetlerin çözümü ile uğraşırlar.",
            rating: "8.4",
            image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/ri3j5LuXQqLYVTMSPfwhrxHwDrZ.jpg",
            trailerUrl: "https://www.youtube.com/embed/PL0HM8ylznI",
            director: "Serdar Akar",
            seasons: "3 sezon",
            cast: [
                { name: "Erdal Beşikçioğlu", character: "Behsat Ç", image: "https://static.wikia.nocookie.net/behzatc/images/7/7e/BEHZAT6938.jpg/revision/latest?cb=20240402194720&path-prefix=tr" },
                { name: "İnanç Konukçu", character: "Hayalet / Sabri Özay", image: "https://img03.imgsinemalar.com/images/haber_anasayfa/behzat-cnin-hayaleti-imdi-de-asik-veyseli-canlandiracak-1401435051.jpg" },
                { name: "Berkan Şal", character: "Akbaba / İsmet Arif Karasu", image: "https://www.iscihaber.net/cropImages/1280x/uploads/haberler/2024/11/9344-behzat-cnin-akbabasi-berkan-saldan-rtuk-cezalarina-elestiri.jpg" }
            ]
        },
        {
            id: "s4",
            title: "Game of Thrones",
            year: "2011-2019",
            categories: ["Fantastik", "Macera"],
            description: "Westeros ve Essos’taki yedi krallığın tahtı için mücadele eden çeşitli ailelerin, politik entrikaların, savaşların ve ejderhaların bulunduğu epik bir fantezi dizisidir. Ailesel ilişkiler, ihanetler ve güç savaşı ön plandadır.",
            rating: "9.2",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
            trailerUrl: "https://www.youtube.com/embed/KPLWWIOCOOQ",
            creator: "David Benioff, D.B. Weiss",
            seasons: "8 sezon",
            cast: [
                { name: "Emilia Clarke", character: "Daenerys Targaryen", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/86jeYFV40KctQMDQIWhJ5oviNGj.jpg" },
                { name: "Kit Harington", character: "Jon Snow", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/4MqUjb1SYrzHmFSyGiXnlZWLvBs.jpg" },
                { name: "Peter Dinklage", character: "Tyrion Lannister", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/9CAd7wr8QZyIN0E7nm8v1B6WkGn.jpg" }
            ]
        },
        {
            id: "s5",
            title: "Stranger Things",
            year: "2016-",
            categories: ["Bilim Kurgu", "Dram"],
            description: "1980'lerde, Indiana'nın küçük bir kasabasında, bir çocuk gizemli bir şekilde kaybolur. Arkadaşları, onu bulmak için araştırmalar yaparken, kasabada garip olaylar ve doğaüstü güçler ortaya çıkar. Paralel bir evren olan Ters Düz (Upside Down) ve gizli hükümet deneyleri ile bağlantılı bir dünya keşfederler. Hem bilim kurgu hem de korku unsurlarını barındıran dizi, arkadaşlık, aile bağları ve büyüme temalarını işler.",
            rating: "8.7",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
            trailerUrl: "https://www.youtube.com/embed/b9EkMc79ZSU",
            creator: "Matt Duffer, Ross Duffer",
            seasons: "4 sezon",
            cast: [
                { name: "Millie Bobby Brown", character: "Eleven", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/3Qblbk5JIMxzlGVd1k1ucSKK7rf.jpg" },
                { name: "Finn Wolfhard", character: "Mike Wheeler", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/5OVmquAk0W5BIsRlVKslEP497JD.jpg" },
                { name: "David Harbour", character: "Jim Hopper", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/chPekukMF5SNnW6b22NbYPqAStr.jpg" }
            ]
        },
        {
            id: "s6",
            title: "The Office",
            year: "2005-2013",
            categories: ["Komedi"],
            description: "Pennsylvania'da bir kağıt şirketinde çalışan ofis çalışanlarının günlük yaşamını konu alan bir komedi dizisidir. Dizi, çalışanların ofis içindeki ilişkilerini ve iş yerindeki garip olayları mizahi bir şekilde işler. Michael Scott (Steve Carell) adlı ofis müdürünün yönetimindeki bu ofiste, çalışanlar arasındaki dinamikler ve absürd durumlar ön plana çıkar.",
            rating: "9.0",
            image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/dg9e5fPRRId8PoBE0F6jl5y85Eu.jpg",
            trailerUrl: "https://www.youtube.com/embed/LHOtME2DL4g",
            creator: "Greg Daniels",
            seasons: "9 sezon",
            cast: [
                { name: "Steve Carell", character: "Michael Scott", image: "https://media.themoviedb.org/t/p/w66_and_h66_face/dA6n0qpnlMFBlTr8SBULsZbWkvn.jpg" },
                { name: "John Krasinski", character: "Jim Halpert", image: "https://media.themoviedb.org/t/p/w66_and_h66_face/pmVGDb6Yl6OyFcHVGbu1EYNfyFK.jpg" },
                { name: "Jenna Fischer", character: "Pam Beesly", image: "https://media.themoviedb.org/t/p/w66_and_h66_face/mfKRbOHTPNi9jFSthtjl4FGVZv6.jpg" }
            ]
        },
        {
            id: "s7",
            title: "Black Mirror",
            year: "2011-",
            categories: ["Bilim Kurgu", "Dram"],
            description: "Modern teknolojinin insan hayatına etkilerini ve karanlık yönlerini anlatan, her bölümü bağımsız hikayelerden oluşan antoloji dizisi.",
            rating: "8.8",
            image: "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/5UaYsGZOFhjFDwQh6GuLjjA1WlF.jpg",
            trailerUrl: "https://www.youtube.com/embed/V0XOApF5nLU",
            creator: "Charlie Brooker",
            seasons: "6 sezon",
            cast: [
                { name: "Bryce Dallas Howard", character: "Lacie Pound", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/l9KTey4DqwazBkUgIEqfvMDCkaq.jpg" },
                { name: "Daniel Kaluuya", character: "Bing", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/jj2kZqJobjom36wlhlYhc38nTwN.jpg" },
                { name: "Jon Hamm", character: "Matt Trent", image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/mrXE5fZbEDPc7BEE5G21J6qrwzi.jpg" }
            ]
        },
        {
            id: "s8",
            title: "Sherlock",
            year: "2010-2017",
            categories: ["Suç", "Dram"],
            description: "Arthur Conan Doyle'un ünlü eserinden uyarlanan yapımda, kahramanlarımız Sherlock Holmes ve Dr. John Watson günümüz Londra'sında sıradışı cinayetleri çözmeye çalışıyorlar. Huysuz Sherlock ile insancıl John, maceradan maceraya atılırken, izleyici kendisini aksiyondan komediye uzanan bir koşuşturmacanın içinde buluyor.",
            rating: "9.1",
            image: "https://media.themoviedb.org/t/p/w300_and_h450_bestv2/cIfGAkpvWD2zxHrXzhv3uptYbyV.jpg",
            trailerUrl: "https://www.youtube.com/embed/IrBKwzL3K7s",
            creator: "Mark Gatiss, Steven Moffat",
            seasons: "4 sezon",
            cast: [
                { name: "Benedict Cumberbatch", character: "Sherlock Holmes", image: "https://www.themoviedb.org/t/p/w138_and_h175_face/fBEucxECxGLKVHBznO0qHtCGiMO.jpg" },
                { name: "Martin Freeman", character: "Dr. John Watson", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/ktLqOkNC9MQ8Xb10PKIagRx5XEP.jpg" },
                { name: "Andrew Scott", character: "Jim Moriarty", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/4F8XpjyQCvtuu21WFm5d8RF5Rl.jpg" }
            ]
        },
        {
            id: "s9",
            title: "The Wire",
            year: "2002-2008",
            categories: ["Suç", "Dram"],
            description: "Baltimore'daki uyuşturucu ticareti, polis teşkilatı, eğitim sistemi ve medya gibi çeşitli kurumları detaylı bir şekilde inceleyen bir drama dizisidir. Her sezonda farklı bir yönü ele alarak, suç, adalet ve toplum yapısının iç içe geçtiği bir hikaye anlatır.",
            rating: "9.3",
            image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4lbclFySvugI51fwsyxBTOm4DqK.jpg",
            trailerUrl: "https://www.youtube.com/embed/apZQlqPp6Hs",
            creator: "David Simon",
            seasons: "5 sezon",
            cast: [
                { name: "Dominic West", character: "Jimmy McNulty", image: "https://media.themoviedb.org/t/p/w138_and_h175_face/OsYqaHi79rTkI9p6JbqAU3GhSt.jpg" },
                { name: "Idris Elba", character: "Stringer Bell", image: "https://media.themoviedb.org/t/p/w66_and_h66_face/be1bVF7qGX91a6c5WeRPs5pKXln.jpg" },
                { name: "Michael K. Williams", character: "Omar Little", image: "https://media.themoviedb.org/t/p/w66_and_h66_face/kQCO55YZsQGuE4b8ukRsCMqrREh.jpg" }
            ]
        },
        // Diğer diziler (s3-s9) buraya - mevcut koddan korunacak
    ],

    // Footer içerik sayfaları
    pages: {
        "helpCenter": {
            title: "Yardım Merkezi",
            content: `
                <h2>Sık Sorulan Sorular</h2>
                <div class="faq-item">
                    <h3>CineVibe'ı nasıl kullanabilirim?</h3>
                    <p>CineVibe'da film ve dizileri keşfetmek için ana sayfada gezinebilir, kategorilere göz atabilir veya arama kutusunu kullanabilirsiniz. Detaylı bilgi için bir içeriğe tıklamanız yeterlidir.</p>
                </div>
                <div class="faq-item">
                    <h3>İçerikler nasıl sıralanıyor?</h3>
                    <p>İçerikler popülerlik, yayın tarihi ve kullanıcı değerlendirmelerine göre sıralanmaktadır. Film ve dizi sayfalarında farklı kategorilere göre filtreleme yapabilirsiniz.</p>
                </div>
                <div class="faq-item">
                    <h3>Hesap oluşturmak için ne yapmalıyım?</h3>
                    <p>Sağ üst köşedeki "Giriş Yap" butonuna tıklayarak kayıt formuna ulaşabilir ve ücretsiz bir hesap oluşturabilirsiniz.</p>
                </div>
                <div class="faq-item">
                    <h3>Teknik bir sorun yaşıyorum, ne yapmalıyım?</h3>
                    <p>Teknik sorunlar için "İletişim" sayfasındaki formu kullanarak bize ulaşabilirsiniz. Ekibimiz en kısa sürede size yardımcı olacaktır.</p>
                </div>
            `
        },
        "contactForm": {
            title: "İletişim Formu",
            content: `
                <h2>Bizimle İletişime Geçin</h2>
                <p class="page-desc">Herhangi bir soru, öneri veya geri bildiriminiz için aşağıdaki formu kullanabilirsiniz. En kısa sürede size dönüş yapacağız.</p>
                
                <form class="contact-form">
                    <div class="form-group">
                        <label for="name">Adınız Soyadınız</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">E-posta Adresiniz</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Konu</label>
                        <select id="subject" name="subject">
                            <option value="general">Genel Bilgi</option>
                            <option value="technical">Teknik Destek</option>
                            <option value="suggestion">Öneri/Geri Bildirim</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Mesajınız</label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn">Gönder</button>
                </form>
            `
        },
        "privacyPolicy": {
            title: "Gizlilik Politikası",
            content: `
                <h2>Gizlilik Politikası</h2>
                <p class="last-updated">Son güncelleme: 17 Mart 2025</p>
                
                <div class="policy-section">
                    <h3>1. Toplanan Bilgiler</h3>
                    <p>CineVibe olarak, sizden aşağıdaki bilgileri toplayabiliriz:</p>
                    <ul>
                        <li>Kişisel bilgiler (isim, e-posta adresi, telefon numarası vb.)</li>
                        <li>Kullanım verileri (ziyaret ettiğiniz sayfalar, tıkladığınız içerikler vb.)</li>
                        <li>Cihaz bilgileri (IP adresi, tarayıcı tipi, işletim sistemi vb.)</li>
                    </ul>
                </div>
                
                <div class="policy-section">
                    <h3>2. Bilgilerin Kullanımı</h3>
                    <p>Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:</p>
                    <ul>
                        <li>Hizmetlerimizi sunmak ve geliştirmek</li>
                        <li>Kişiselleştirilmiş içerik ve öneriler sunmak</li>
                        <li>Kullanıcı deneyimini iyileştirmek</li>
                        <li>Size bildirimler ve güncellemeler göndermek</li>
                    </ul>
                </div>
                
                <div class="policy-section">
                    <h3>3. Bilgilerin Paylaşımı</h3>
                    <p>Bilgilerinizi şu durumlarda üçüncü taraflarla paylaşabiliriz:</p>
                    <ul>
                        <li>Yasal zorunluluk durumunda</li>
                        <li>Hizmet sağlayıcılarımızla (yalnızca hizmetleri sunmak için gerekli olduğunda)</li>
                        <li>Açık izniniz olduğunda</li>
                    </ul>
                </div>
                
                <div class="policy-section">
                    <h3>4. Çerezler ve Takip Teknolojileri</h3>
                    <p>Sitemizde çeşitli çerezler ve benzer teknolojiler kullanıyoruz. Bu teknolojiler, size daha iyi bir kullanıcı deneyimi sunmamıza ve hizmetlerimizi geliştirmemize yardımcı olur.</p>
                </div>
                
                <div class="policy-section">
                    <h3>5. İletişim</h3>
                    <p>Gizlilik politikamızla ilgili sorularınız için bizimle iletişime geçebilirsiniz.</p>
                </div>
            `
        },
        "termsConditions": {
            title: "Koşullar ve Şartlar",
            content: `
                <h2>Koşullar ve Şartlar</h2>
                <p class="last-updated">Son güncelleme: 17 Mart 2025</p>
                
                <div class="policy-section">
                    <h3>1. Kabul Edilen Şartlar</h3>
                    <p>CineVibe web sitesini kullanarak, bu Koşullar ve Şartlar'ı kabul etmiş sayılırsınız. Bu şartları kabul etmiyorsanız, lütfen sitemizi kullanmayın.</p>
                </div>
                
                <div class="policy-section">
                    <h3>2. Kullanım Lisansı</h3>
                    <p>CineVibe, size kişisel, ticari olmayan kullanım için sınırlı, geri alınabilir, münhasır olmayan bir lisans verir. Bu lisans kapsamında:</p>
                    <ul>
                        <li>İçerikleri değiştiremez veya kopyalayamazsınız</li>
                        <li>İçerikleri ticari amaçlarla kullanamazsınız</li>
                        <li>Telif hakkı ve diğer mülkiyet bildirimlerini kaldıramazsınız</li>
                    </ul>
                </div>
                
                <div class="policy-section">
                    <h3>3. Hesap Oluşturma</h3>
                    <p>Bazı hizmetlerimizden yararlanmak için hesap oluşturmanız gerekebilir. Hesabınızla ilgili tüm bilgilerin doğru ve güncel olmasından siz sorumlusunuz.</p>
                </div>
                
                <div class="policy-section">
                    <h3>4. Kullanıcı Davranışları</h3>
                    <p>Aşağıdaki davranışlar kesinlikle yasaktır:</p>
                    <ul>
                        <li>Yasa dışı veya zararlı içerik paylaşmak</li>
                        <li>Başkalarının haklarını ihlal etmek</li>
                        <li>Siteye zarar verecek faaliyetlerde bulunmak</li>
                        <li>Diğer kullanıcılara taciz veya tehdit uygulamak</li>
                    </ul>
                </div>
                
                <div class="policy-section">
                    <h3>5. Fikri Mülkiyet</h3>
                    <p>CineVibe'daki tüm içerikler, logolar, tasarımlar ve yazılımlar, CineVibe'ın veya lisans verenlerin mülkiyetindedir.</p>
                </div>
                
                <div class="policy-section">
                    <h3>6. Hizmet Değişiklikleri</h3>
                    <p>CineVibe, herhangi bir zamanda, herhangi bir sebeple, önceden bildirimde bulunmaksızın hizmetlerini değiştirme veya sonlandırma hakkını saklı tutar.</p>
                </div>
                
                <div class="policy-section">
                    <h3>7. Sorumluluk Sınırlaması</h3>
                    <p>CineVibe, sitemizin kullanımından kaynaklanan doğrudan, dolaylı veya arızi zararlardan sorumlu tutulamaz.</p>
                </div>
            `
        },
        "aboutUs": {
            title: "Hakkımızda",
            content: `
                <h2>CineVibe Hakkında</h2>
                <p class="page-desc">CineVibe, film ve dizi tutkunları için tasarlanmış modern bir içerik keşif platformudur. Amacımız, kullanıcılarımıza en iyi film ve dizi deneyimini sunmaktır.</p>
                
                <div class="about-section">
                    <h3>Vizyonumuz</h3>
                    <p>Film ve dizi dünyasında rehberiniz olmak ve size en kaliteli içerikleri en kullanıcı dostu şekilde sunmak.</p>
                </div>
                
                <div class="about-section">
                    <h3>Misyonumuz</h3>
                    <p>Kullanıcılarımıza geniş bir film ve dizi koleksiyonu sunarak, onların yeni içerikler keşfetmelerini sağlamak ve sinema deneyimlerini zenginleştirmek.</p>
                </div>
                
                <div class="about-section">
                    <h3>Ekibimiz</h3>
                    <p>CineVibe, film ve dizi tutkunu profesyonellerden oluşan bir ekip tarafından yönetilmektedir. Ekibimiz, kullanıcılarımıza en güncel ve kaliteli içerikleri sunmak için sürekli çalışmaktadır.</p>
                </div>
                
                <div class="about-section">
                    <h3>İletişim</h3>
                    <p>Sorularınız veya önerileriniz için bizimle <a href="#" class="content-link" data-page="contactForm">iletişime geçebilirsiniz</a>.</p>
                </div>
            `
        }
    }
};

// DOM elemanlarını seçme
const movieGrid = document.getElementById('movie-grid');
const seriesGrid = document.getElementById('series-grid');
const filteredGrid = document.getElementById('filtered-grid');
const homepageContent = document.getElementById('homepage-content');
const filteredContent = document.getElementById('filtered-content');
const detailContainer = document.getElementById('detail-container');
const filteredTitle = document.getElementById('filtered-title');
const categoryFilter = document.getElementById('category-filter');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const backButton = document.getElementById('back-button');
const contentContainer = document.getElementById('content-container');

// Statik sayfa için konteyner
let pageContainer = null;

// İçerik görüntüleme fonksiyonları
function createContentCard(item, type) {
    const card = document.createElement('div');
    card.className = type === 'movie' ? 'movie-card' : 'series-card';
    card.setAttribute('data-id', item.id);
    card.setAttribute('data-type', type);
    
    card.innerHTML = `
        <div class="card-img">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/280x400?text=Görsel+Yok'; this.onerror='';">
        </div>
        <div class="card-content">
            <div class="card-category">
                ${item.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
            </div>
            <h3 class="card-title">${item.title} (${item.year})</h3>
            <p class="card-desc">Konu: ${item.description}</p>
            <div class="card-rating">
                <span class="imdb-badge">${item.rating}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => showDetailPage(item, type));
    
    return card;
}

// Tüm içerik bölümlerini kapat
function hideAllContentSections() {
    homepageContent.style.display = 'none';
    filteredContent.style.display = 'none';
    detailContainer.style.display = 'none';
    
    // Statik sayfa varsa onu da kaldır
    if (pageContainer) {
        contentContainer.removeChild(pageContainer);
        pageContainer = null;
    }
    const watchlistContent = document.getElementById('watchlist-content');
    if (watchlistContent) {
        watchlistContent.style.display = 'none';
    }
}

// Ana sayfa içeriğini yükleme
function loadHomepageContent() {
    // Önce tüm içerikleri gizle
    hideAllContentSections();
    homepageContent.style.display = 'block';
    
    // Filmleri temizle ve ekle
    movieGrid.innerHTML = '';
    contentDatabase.movies.slice(0, 3).forEach(movie => {
        movieGrid.appendChild(createContentCard(movie, 'movie'));
    });
    
    // Dizileri temizle ve ekle
    seriesGrid.innerHTML = '';
    contentDatabase.series.slice(0, 3).forEach(series => {
        seriesGrid.appendChild(createContentCard(series, 'series'));
    });
    
    // Sayfa başına scroll
    window.scrollTo(0, 0);
}

// Tüm filmleri yükleme
function loadAllMovies(category = 'all') {
    // Önce tüm içerikleri gizle
    hideAllContentSections();
    filteredContent.style.display = 'block';
    
    filteredTitle.textContent = 'Tüm Filmler';
    filteredGrid.innerHTML = '';
    
    let filteredMovies = contentDatabase.movies;
    if (category !== 'all') {
        filteredMovies = contentDatabase.movies.filter(movie => 
            movie.categories.includes(category)
        );
    }
    
    if (filteredMovies.length === 0) {
        filteredGrid.innerHTML = '<p class="no-content">Bu kategoride film bulunamadı.</p>';
        return;
    }
    
    filteredMovies.forEach(movie => {
        filteredGrid.appendChild(createContentCard(movie, 'movie'));
    });
    
    // Son görüntülenen içerik tipini kaydet
    sessionStorage.setItem('lastViewedType', 'allMovies');
    
    // Sayfa başına scroll
    window.scrollTo(0, 0);
    
    // Kategori filtresini güncelle
    categoryFilter.value = category;
}

// Tüm dizileri yükleme
function loadAllSeries(category = 'all') {
    // Önce tüm içerikleri gizle
    hideAllContentSections();
    filteredContent.style.display = 'block';
    
    filteredTitle.textContent = 'Tüm Diziler';
    filteredGrid.innerHTML = '';
    
    let filteredSeries = contentDatabase.series;
    if (category !== 'all') {
        filteredSeries = contentDatabase.series.filter(series => 
            series.categories.includes(category)
        );
    }
    
    if (filteredSeries.length === 0) {
        filteredGrid.innerHTML = '<p class="no-content">Bu kategoride dizi bulunamadı.</p>';
        return;
    }
    
    filteredSeries.forEach(series => {
        filteredGrid.appendChild(createContentCard(series, 'series'));
    });
    
    // Son görüntülenen içerik tipini kaydet
    sessionStorage.setItem('lastViewedType', 'allSeries');
    
    // Sayfa başına scroll
    window.scrollTo(0, 0);
    
    // Kategori filtresini güncelle
    categoryFilter.value = category;
}

// Detay sayfasını gösterme
function showDetailPage(item, type) {
    // Önce tüm içerikleri gizle
    hideAllContentSections();
    detailContainer.style.display = 'block';
    
    // Detay sayfası içeriğini doldur
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-year').textContent = item.year;
    document.getElementById('detail-categories').textContent = item.categories.join(', ');
    document.getElementById('detail-rating').textContent = item.rating;
    document.getElementById('detail-description').textContent = item.description;
    
    // YouTube fragmanını yükle
    document.getElementById('youtube-frame').src = item.trailerUrl;
    
    // Oyuncu kadrosunu göster
    const castContainer = document.getElementById('detail-cast');
    castContainer.innerHTML = '';
    
    // Ek bilgiler bölümü
    const detailInfo = document.createElement('div');
    detailInfo.className = 'additional-info';
    
    if (type === 'movie') {
        detailInfo.innerHTML = `
            <p><strong>Yönetmen:</strong> ${item.director || 'Bilgi yok'}</p>
            <p><strong>Süre:</strong> ${item.duration || 'Bilgi yok'}</p>
        `;
    } else if (type === 'series') {
        detailInfo.innerHTML = `
            <p><strong>Yapımcı/Yaratıcı:</strong> ${item.creator || 'Bilgi yok'}</p>
            <p><strong>Sezon Sayısı:</strong> ${item.seasons || 'Bilgi yok'}</p>
        `;
    }
    
    // Açıklama metninin olduğu section'ı bul ve ek bilgileri ekle
    const descriptionSection = document.querySelector('.detail-section');
    
    // Önce varsa eski ek bilgileri temizle
    const existingInfo = descriptionSection.querySelector('.additional-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Açıklamadan sonra ek bilgileri ekle
    const descriptionP = document.getElementById('detail-description');
    descriptionP.parentNode.insertBefore(detailInfo, descriptionP.nextSibling);
    
    // Oyuncu listesi oluşturma
    item.cast.forEach(actor => {
        const castItem = document.createElement('div');
        castItem.className = 'cast-item';
        
        castItem.innerHTML = `
            <div class="cast-image">
                <img src="${actor.image}" alt="${actor.name}" onerror="this.src='https://via.placeholder.com/138x175?text=Oyuncu+Görseli'; this.onerror='';">
            </div>
            <div class="cast-info">
                <h4>${actor.name}</h4>
                <p>${actor.character}</p>
            </div>
        `;
        castContainer.appendChild(castItem);
    });
    

    // Sayfa başına scroll
    window.scrollTo(0, 0);}
