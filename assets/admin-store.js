/* Techinverse admin store — product catalog persisted in localStorage.
 * Works on any static host (file://, preview, GitHub Pages) with zero backend.
 * Key: tis_products_v1 — array of product records.
 */
(function (global) {
    'use strict';

    var KEY = 'tis_products_v1';

    // ---- Seed catalog (captured from the live site on 2026-11-05) ----
    // Each record: id, name, category, price (number, NGN), short, full,
    // stock ('in'|'out'|'low'), qty, img (local relative path), href (detail page)
    var SEED = [
        {"id":"p01","name":"Lenovo ThinkPad x1 Carbon Intel Core i7 8th generation","category":"Laptops","price":460000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-2caeca33b0.webp","href":"products/lenovo-thinkpad-x1-carbon-intel-core-i7-8th-generation.html"},
        {"id":"p02","name":"Dell latitude 7410 Intel Core i5 10th generation","category":"Laptops","price":335000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-575d21de86.webp","href":"products/dell-latitude-7410-intel-core-i5-10th-generation.html"},
        {"id":"p03","name":"Dell latitude 5410 Intel core i5 10th generation","category":"Laptops","price":305000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-9ce142a8ad.webp","href":"products/dell-latitude-5410-intel-core-i5-10th-generation.html"},
        {"id":"p04","name":"Dell latitude 5410 Intel Core i5 10th generation sweet deal","category":"Laptops","price":350000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-066950a1a3.webp","href":"products/dell-latitude-5410-intel-core-i5-10th-generation-sweet-deal.html"},
        {"id":"p05","name":"Apple iPad 6th gen","category":"iPAD","price":160000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-8beaf97573.webp","href":"https://techinversesolutions.com/products/apple-ipad-6th-gen"},
        {"id":"p06","name":"Dell latitude 5310 2in1 Silver color 10th generation Touchscreen And x360 Convertible","category":"Laptops","price":380000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-4ec1046268.webp","href":"products/dell-latitude-5310-2in1-silver-color-10th-generation-touchscreen-and-x360-convertible.html"},
        {"id":"p07","name":"Dell Latitude 5300 Intel Core i5 8th generation Keyboard light","category":"Laptops","price":385000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-e8533a408e.webp","href":"products/dell-latitude-5300-intel-core-i5-8th-generation-keyboard-light.html"},
        {"id":"p08","name":"Ho Elitebook 630 G10, TOUCHSCREEN 13th gen Core i7","category":"Laptops","price":750000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-c9e44c301a.webp","href":"products/ho-elitebook-630-g10-touchscreen-13th-gen-core-i7.html"},
        {"id":"p09","name":"Open BoX Hp Elitebook 1040 G8 x360 Touchscreen 32gb/512gb ssd","category":"Laptops","price":850000,"short":"","full":"","stock":"in","qty":2,"img":"images/img-3f828844ab.webp","href":"products/open-box-hp-elitebook-1040-g8-x360-touchscreen-32gb512gb-ssd.html"},
        {"id":"p10","name":"Dell Latitude 7400 Intel Core i5 8th generation","category":"Laptops","price":295000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-a765aa11aa.webp","href":"products/dell-latitude-7400-intel-core-i5-8th-generation.html"},
        {"id":"p11","name":"Laptop Model: Hp Probook x360 435 G8 Touchscreen","category":"Laptops","price":380000,"short":"","full":"","stock":"in","qty":5,"img":"images/img-e854b3b5f4.webp","href":"products/laptop-model-hp-probook-x360-435-g8-touchscreen.html"},
        {"id":"p12","name":"Dell latitude 3120 2-in-1 Pentium Silver 11th generation X360 Touchscreen","category":"Laptops","price":195000,"short":"","full":"","stock":"in","qty":10,"img":"images/img-8171e0ddf7.webp","href":"products/dell-latitude-3120-2-in-1-pentium-silver-11th-generation-x360-touchscreen.html"},
        {"id":"p13","name":"Dell latitude 7490 Intel core i7 8th generation","category":"Laptops","price":335000,"short":"","full":"","stock":"in","qty":10,"img":"images/img-28993d54ef.webp","href":"products/dell-latitude-7490-intel-core-i7-8th-generation.html"},
        {"id":"p14","name":"Hp Elitebook 630 G10 Touchscreen 13th gen Intel core i7","category":"Laptops","price":950000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-6173734b95.webp","href":"https://techinversesolutions.com/products/hp-elitebook-630-g10-touchscreen-13th-gen-intel-core-i7"},
        {"id":"p15","name":"Dell latitude 7420 intel Core i7 32gb Ram 11th generation","category":"Laptops","price":600000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-16863a12b7.webp","href":"https://techinversesolutions.com/products/dell-latitude-7420-intel-core-i7-32gb-ram-11th-generation"},
        {"id":"p16","name":"Dell latitude 5320 Intel core i5 11th generation 16gb ram TOUCHSCREEN","category":"Laptops","price":380000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-e4b59d873c.webp","href":"https://techinversesolutions.com/products/dell-latitude-5320-intel-core-i5-11th-generation-16gb-ram"},
        {"id":"p17","name":"Alienware M16 R2, Intel\u00ae Core\u2122 Ultra 7 155H, 8gb NVIDIA GeForce RTX 4070","category":"Laptops","price":2500000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-4376460992.webp","href":"https://techinversesolutions.com/products/alienware-m16-r2-intel-core-ultra-7-155h-8gb-nvidia-geforce-rtx-4070"},
        {"id":"p18","name":"Hp Elitebook 830 G7, (Touchscreen) 10th gen","category":"Laptops","price":460000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-8f3dbbc487.webp","href":"https://techinversesolutions.com/products/hp-elitebook-830-g7-touchscreen-10th-gen"},
        {"id":"p19","name":"MacBook Pro 2018 intel core i9 4gb Dedicated graphics 32gb ram 1TB SSD","category":"Laptops","price":850000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-4ea726f399.webp","href":"https://techinversesolutions.com/products/macbook-pro-2019-intel-core-i7-8gb-dedicated-graphics-16gb-ram"},
        {"id":"p20","name":"Microsoft Surface Laptop Studio, Intel core i7, 11th generation, 4GB NVIDIA GeForce RTX 3050 Ti Laptop GPU","category":"Laptops","price":1250000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-0b6a9d38c2.webp","href":"https://techinversesolutions.com/products/microsoft-surface-laptop-studio-intel-core-i7-11th-generation-4gb-nvidia-geforce-rtx-3050-ti-laptop-gpu"},
        {"id":"p21","name":"\ud83d\udecd\ufe0fLaptop Model: Hp Elitebook x360 1040 G9 Touchscreen Core i7, 12th generation (10cores, 12 logical Processor)","category":"Laptops","price":790000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-96bf5b24e5.webp","href":"https://techinversesolutions.com/products/laptop-model-hp-elitebook-x360-1040-g9-touchscreen-core-i7-12th-generation-10cores-12-logical-processor"},
        {"id":"p22","name":"Brand new Double Lens CCTV Camera","category":"Accessories","price":75000,"short":"","full":"","stock":"in","qty":25,"img":"images/img-f36ff44a51.webp","href":"products/brand-new-double-lens-cctv-camera.html"},
        {"id":"p23","name":"Brand New Tripple Lens CCTV Camera with Solar Panels","category":"Accessories","price":85000,"short":"","full":"","stock":"in","qty":20,"img":"images/img-64da37ee23.webp","href":"products/brand-new-tripple-lens-cctv-camera-with-solar-panels.html"},
        {"id":"p24","name":"MacBook Pro 2019, 4gb Dedicated Graphics, core i7, 16gb ram, 512gb ssd","category":"Laptops","price":700000,"short":"","full":"","stock":"in","qty":0,"img":"images/img-31a2e619b5.webp","href":"https://techinversesolutions.com/products/macbook-pro-2019-4gb-dedicated-graphics-core-i7-16gb-ram-512gb-ssd"}
    ];

    function load() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) { save(SEED); return JSON.parse(JSON.stringify(SEED)); }
            var arr = JSON.parse(raw);
            if (!Array.isArray(arr)) throw new Error('bad data');
            return arr;
        } catch (e) {
            // Corrupt/blocked storage — fall back to seed, keep it in-memory.
            return JSON.parse(JSON.stringify(SEED));
        }
    }

    function save(list) {
        try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* silent */ }
    }

    function fetchField(p, field) {
        try {
            var raw = localStorage.getItem(KEY);
            if (raw) {
                var arr = JSON.parse(raw);
                var found = arr.filter(function (x) { return x.id === p.id; })[0];
                if (found && found[field] !== undefined) return found[field];
            }
        } catch (e) { /* silent */ }
        return p[field];
    }

    function all() { return load(); }
    function get(id) {
        var list = load();
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return null;
    }
    function upsert(record) {
        var list = load();
        var idx = -1;
        for (var i = 0; i < list.length; i++) if (list[i].id === record.id) { idx = i; break; }
        if (idx >= 0) list[idx] = record; else list.unshift(record);
        save(list);
        return record;
    }
    function remove(id) {
        var list = load().filter(function (x) { return x.id !== id; });
        save(list);
        return list;
    }
    function nextId() {
        var list = load();
        var max = 0;
        for (var i = 0; i < list.length; i++) {
            var n = parseInt(String(list[i].id).replace(/\D/g, ''), 10);
            if (!isNaN(n) && n > max) max = n;
        }
        return 'p' + String(max + 1).padStart(2, '0');
    }

    global.AdminStore = {
        KEY: KEY,
        all: all,
        get: get,
        upsert: upsert,
        remove: remove,
        nextId: nextId,
        fetchField: fetchField,
        // format helpers shared by admin + site pages
        fmtNaira: function (n) {
            var num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^\d.]/g, ''));
            if (isNaN(num)) return '\u20a60';
            return '\u20a6' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        },
        slugify: function (s) {
            return String(s).toLowerCase().trim()
                .replace(/&/g, ' and ')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 90);
        }
    };
})(window);
