/* ============================================================================
 * Techinverse Solutions — shared product backend
 * ----------------------------------------------------------------------------
 * One API used by the admin page and by the public product pages.
 *
 *   TIS.listProducts()        -> Promise<Product[]>
 *   TIS.getProduct(id)        -> Promise<Product|null>
 *   TIS.saveProduct(record)   -> Promise<Product>      (insert or update)
 *   TIS.deleteProduct(id)     -> Promise<void>
 *   TIS.uploadImage(file)     -> Promise<string url>
 *   TIS.signIn(email, pass)   -> Promise<void>
 *   TIS.signOut()
 *   TIS.isSignedIn()          -> bool
 *   TIS.mode                  -> 'supabase' | 'local'
 *
 * When Supabase is not configured (assets/tis-config.js is blank) every call
 * transparently falls back to the browser's localStorage, so the site keeps
 * working with no backend at all. The public pages then show the built-in
 * catalog, and admin edits stay in that one browser.
 * ========================================================================== */
(function (global) {
    'use strict';

    var CFG = global.TIS_CONFIG || {};
    var URL_BASE = String(CFG.SUPABASE_URL || '').replace(/\/+$/, '');
    var KEY = CFG.SUPABASE_ANON_KEY || '';
    var BUCKET = CFG.STORAGE_BUCKET || 'product-images';
    var TABLE = 'products';

    var MODE = (URL_BASE && KEY) ? 'supabase' : 'local';
    var LS_KEY = 'tis_products_v1';
    var SESSION_KEY = 'tis_sb_session';

    /* ---------------------------------------------------------------- utils */

    function fmtNaira(n) {
        var num = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^\d.]/g, ''));
        if (isNaN(num)) return '\u20a60';
        return '\u20a6' + num.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function slugify(s) {
        return String(s).toLowerCase().trim()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 90);
    }

    /* ------------------------------------------------------------- session */

    function readSession() {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
        catch (e) { return null; }
    }
    function writeSession(s) {
        try {
            if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
            else sessionStorage.removeItem(SESSION_KEY);
        } catch (e) { /* private mode */ }
    }
    function accessToken() {
        var s = readSession();
        if (!s || !s.access_token) return null;
        // refresh a minute before expiry
        if (s.expires_at && Date.now() > s.expires_at - 60000) return null;
        return s.access_token;
    }
    function isSignedIn() {
        if (MODE === 'local') return false;
        return !!accessToken();
    }

    function signIn(email, password) {
        if (MODE === 'local') return Promise.reject(new Error('Backend not configured'));
        return fetch(URL_BASE + '/auth/v1/token?grant_type=password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': KEY },
            body: JSON.stringify({ email: email, password: password })
        }).then(function (r) {
            return r.json().then(function (body) {
                if (!r.ok) {
                    var msg = body.error_description || body.msg || body.error || 'Sign-in failed';
                    throw new Error(msg);
                }
                writeSession({
                    access_token: body.access_token,
                    refresh_token: body.refresh_token,
                    expires_at: Date.now() + (body.expires_in || 3600) * 1000,
                    email: (body.user && body.user.email) || email
                });
                return body;
            });
        });
    }

    function signOut() {
        var s = readSession();
        writeSession(null);
        if (MODE === 'supabase' && s && s.access_token) {
            // best effort — revoke server-side
            fetch(URL_BASE + '/auth/v1/logout', {
                method: 'POST',
                headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + s.access_token }
            }).catch(function () {});
        }
    }

    /* ------------------------------------------------------- local fallback */

    function localSeed() {
        // The built-in catalog lives in admin-store.js (window.__TIS_SEED__).
        var seed = global.__TIS_SEED__ || [];
        return JSON.parse(JSON.stringify(seed));
    }
    function localAll() {
        try {
            var raw = localStorage.getItem(LS_KEY);
            if (!raw) return localSeed();
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : localSeed();
        } catch (e) { return localSeed(); }
    }
    function localSave(list) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch (e) {}
    }

    /* --------------------------------------------------------- REST helpers */

    function rest(path, opts) {
        opts = opts || {};
        var headers = {
            'apikey': KEY,
            'Content-Type': 'application/json'
        };
        var tok = accessToken();
        if (tok) headers['Authorization'] = 'Bearer ' + tok;
        if (opts.headers) for (var k in opts.headers) headers[k] = opts.headers[k];

        return fetch(URL_BASE + '/rest/v1/' + path, {
            method: opts.method || 'GET',
            headers: headers,
            body: opts.body
        }).then(function (r) {
            if (r.status === 204) return null;
            return r.text().then(function (txt) {
                var data = null;
                try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
                if (!r.ok) {
                    var msg = (data && (data.message || data.hint || data.details)) || ('HTTP ' + r.status);
                    var err = new Error(msg);
                    err.status = r.status;
                    err.body = data;
                    throw err;
                }
                return data;
            });
        });
    }

    /* ------------------------------------------------------------- mapping */

    // DB row -> app record (keeps the shape the pages already expect)
    function fromRow(r) {
        return {
            id: r.id,
            name: r.name,
            category: r.category || '',
            price: r.price == null ? 0 : Number(r.price),
            short: r.short || '',
            full: r.full || '',
            stock: r.stock || 'in',
            qty: r.qty == null ? 0 : Number(r.qty),
            img: r.img || '',
            href: r.href || ''
        };
    }

    // app record -> DB row
    function toRow(p) {
        return {
            id: p.id,
            name: p.name,
            category: p.category || 'Uncategorized',
            price: p.price == null ? 0 : Number(p.price),
            short: p.short || '',
            full: p.full || '',
            stock: p.stock || 'in',
            qty: p.qty == null ? 0 : parseInt(p.qty, 10) || 0,
            img: p.img || '',
            href: p.href || ''
        };
    }

    /* ------------------------------------------------------------ public API */

    function listProducts() {
        if (MODE === 'local') return Promise.resolve(localAll());
        return rest(TABLE + '?select=*&order=created_at.asc')
            .then(function (rows) { return (rows || []).map(fromRow); })
            .catch(function (err) {
                // Never leave the public site blank: fall back to the built-in
                // catalog if the backend is unreachable, and say so in console.
                console.warn('[TIS] backend read failed, using built-in catalog:', err.message);
                return localAll();
            });
    }

    function getProduct(id) {
        if (!id) return Promise.resolve(null);
        if (MODE === 'local') {
            var list = localAll();
            for (var i = 0; i < list.length; i++) if (list[i].id === id) return Promise.resolve(list[i]);
            return Promise.resolve(null);
        }
        return rest(TABLE + '?id=eq.' + encodeURIComponent(id) + '&select=*&limit=1')
            .then(function (rows) {
                if (rows && rows.length) return fromRow(rows[0]);
                // not in the shared DB yet — check the built-in catalog
                var seed = localSeed();
                for (var i = 0; i < seed.length; i++) if (seed[i].id === id) return seed[i];
                return null;
            })
            .catch(function () {
                var seed = localSeed();
                for (var i = 0; i < seed.length; i++) if (seed[i].id === id) return seed[i];
                return null;
            });
    }

    function saveProduct(record) {
        if (MODE === 'local') {
            var list = localAll();
            var idx = -1;
            for (var i = 0; i < list.length; i++) if (list[i].id === record.id) { idx = i; break; }
            if (idx >= 0) list[idx] = record; else list.unshift(record);
            localSave(list);
            return Promise.resolve(record);
        }
        if (!isSignedIn()) return Promise.reject(new Error('Not signed in'));
        var row = toRow(record);
        return rest(TABLE + '?on_conflict=id', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
            body: JSON.stringify([row])
        }).then(function (rows) {
            return rows && rows.length ? fromRow(rows[0]) : record;
        });
    }

    function deleteProduct(id) {
        if (MODE === 'local') {
            localSave(localAll().filter(function (x) { return x.id !== id; }));
            return Promise.resolve();
        }
        if (!isSignedIn()) return Promise.reject(new Error('Not signed in'));
        return rest(TABLE + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
    }

    function nextId() {
        return listProducts().then(function (list) {
            var max = 0;
            for (var i = 0; i < list.length; i++) {
                var n = parseInt(String(list[i].id).replace(/\D/g, ''), 10);
                if (!isNaN(n) && n > max) max = n;
            }
            return 'p' + String(max + 1).padStart(2, '0');
        });
    }

    /* --------------------------------------------------------- image upload */

    function uploadImage(file) {
        if (MODE === 'local') {
            // No storage without a backend — inline as a data URL so the
            // preview and the saved record still work in this browser.
            return new Promise(function (resolve, reject) {
                var fr = new FileReader();
                fr.onload = function (e) { resolve(e.target.result); };
                fr.onerror = function () { reject(new Error('Could not read image')); };
                fr.readAsDataURL(file);
            });
        }
        if (!isSignedIn()) return Promise.reject(new Error('Not signed in'));
        var ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        var path = 'products/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
        var tok = accessToken();
        return fetch(URL_BASE + '/storage/v1/object/' + BUCKET + '/' + path, {
            method: 'POST',
            headers: {
                'apikey': KEY,
                'Authorization': 'Bearer ' + tok,
                'Content-Type': file.type || 'image/jpeg',
                'x-upsert': 'true'
            },
            body: file
        }).then(function (r) {
            if (!r.ok) {
                return r.text().then(function (t) {
                    throw new Error('Image upload failed: ' + (t || r.status));
                });
            }
            return URL_BASE + '/storage/v1/object/public/' + BUCKET + '/' + path;
        });
    }

    global.TIS = {
        mode: MODE,
        configured: MODE === 'supabase',
        listProducts: listProducts,
        getProduct: getProduct,
        saveProduct: saveProduct,
        deleteProduct: deleteProduct,
        nextId: nextId,
        uploadImage: uploadImage,
        signIn: signIn,
        signOut: signOut,
        isSignedIn: isSignedIn,
        currentEmail: function () { var s = readSession(); return s ? s.email : null; },
        fmtNaira: fmtNaira,
        slugify: slugify
    };
})(window);
