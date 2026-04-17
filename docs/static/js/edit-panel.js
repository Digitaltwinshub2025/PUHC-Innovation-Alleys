/**
 * Edit Mode System
 * - Toggle button on every page (localhost only)
 * - localStorage persistence
 * - Section-based sidebar with field descriptions and image previews
 * - No inline editing, no drag-and-drop, no layout mutation
 */
(function () {
    'use strict';

    // ----------------------------------------------------------
    // Field metadata: human labels + descriptions per page
    // ----------------------------------------------------------
    var FIELD_META = {
        'pages/home': {
            _title: 'Home Page Content',
            hero: {
                _section: 'Hero Section',
                badge:       { label: 'Hero Badge',       hint: 'Small label above the main title on the landing page' },
                title:       { label: 'Hero Heading',     hint: 'Main heading at the top of the Alley 3 landing page' },
                subtitle:    { label: 'Hero Subtitle',    hint: 'One-line subtitle below the main heading' },
                description: { label: 'Hero Description', hint: 'Paragraph below the subtitle explaining the project' },
                cta_text:    { label: 'Button Text',      hint: 'Text on the primary call-to-action button' },
                hero_image:  { label: 'Hero Background',  hint: 'Background image path for the hero section' }
            },
            problem_statement: {
                _section: 'Problem Statement',
                title:       { label: 'Section Title',  hint: 'Heading for the problem statement block' },
                paragraph_1: { label: 'Paragraph 1',    hint: 'First paragraph about LA alleys and the challenge' },
                paragraph_2: { label: 'Paragraph 2',    hint: 'Second paragraph about Water Alley location and zones' }
            },
            zones_section: {
                _section: 'Zones Section',
                title:    { label: 'Section Title',    hint: 'Heading above the four zone cards' },
                subtitle: { label: 'Section Subtitle', hint: 'Description text below the zones heading' }
            },
            interventions_section: {
                _section: 'Interventions Section',
                title:    { label: 'Section Title',    hint: 'Heading above the three intervention cards' },
                subtitle: { label: 'Section Subtitle', hint: 'Description below the interventions heading' }
            },
            digital_twin_section: {
                _section: 'Digital Twin Section',
                title:       { label: 'Section Title',  hint: 'Heading for the 3D simulation preview block' },
                description: { label: 'Description',    hint: 'Paragraph explaining the Unreal Engine digital twin' }
            }
        },
        'pages/existing': {
            _title: 'Existing Conditions Page',
            hero: {
                _section: 'Hero Section',
                badge:      { label: 'Hero Badge',      hint: 'Label above the page title (e.g. BEFORE)' },
                title:      { label: 'Page Title',      hint: 'Main heading on the existing conditions page' },
                subtitle:   { label: 'Page Subtitle',   hint: 'Description line below the title' },
                location:   { label: 'Location Text',   hint: 'Address line shown in the hero area' },
                hero_image: { label: 'Hero Background',  hint: 'Background image for the hero section' }
            },
            baseline_metrics: {
                _section: 'Baseline Metrics',
                title:       { label: 'Metrics Title',  hint: 'Heading above the baseline metrics grid' },
                description: { label: 'Metrics Intro',  hint: 'Explanatory text below the metrics heading' }
            },
            zones_section: {
                _section: 'Zone Documentation',
                title:    { label: 'Section Title',    hint: 'Heading above the zone-by-zone photo grid' },
                subtitle: { label: 'Section Subtitle', hint: 'Description below the zone documentation heading' }
            }
        },
        'pages/compare': {
            _title: 'Compare Page',
            header: {
                _section: 'Page Header',
                badge:    { label: 'Header Badge',    hint: 'Label above the page title (e.g. BEFORE & AFTER)' },
                title:    { label: 'Page Title',      hint: 'Main heading on the compare page' },
                subtitle: { label: 'Page Subtitle',   hint: 'Description line below the title' }
            },
            before_image: {
                _section: 'Before Image',
                path:    { label: 'Image Path',  hint: 'File path for the BEFORE comparison image' },
                caption: { label: 'Caption',     hint: 'Caption text below the before image' }
            },
            after_image: {
                _section: 'After Image',
                path:    { label: 'Image Path',  hint: 'File path for the AFTER comparison image' },
                caption: { label: 'Caption',     hint: 'Caption text below the after image' }
            }
        }
    };

    var AREA_META = {
        _section_prefix: 'Area ',
        name:          { label: 'Zone Name',      hint: 'Display name for this zone card on the home page' },
        description:   { label: 'Description',    hint: 'Short description shown on the zone card' },
        interventions: { label: 'Interventions',   hint: 'Comma-separated list of interventions for this zone' },
        image:         { label: 'Zone Image',      hint: 'Image path for the zone card photo' }
    };

    // ----------------------------------------------------------
    // State
    // ----------------------------------------------------------
    var pageName = document.body.getAttribute('data-edit-page') || detectPageName();
    var contentCache = {};
    var dirtyFields = {};

    function detectPageName() {
        var p = window.location.pathname;
        if (p === '/') return 'home';
        return p.replace(/^\//, '').replace(/-/g, '_');
    }

    // ----------------------------------------------------------
    // 1. Toggle button (always injected on localhost)
    // ----------------------------------------------------------
    function injectToggleButton() {
        var btn = document.createElement('button');
        btn.id = 'editToggleBtn';
        var isOn = localStorage.getItem('editMode') === 'on';
        btn.textContent = isOn ? 'Exit Edit Mode' : 'Edit';
        if (isOn) btn.classList.add('active');
        btn.addEventListener('click', function () {
            var currentlyOn = localStorage.getItem('editMode') === 'on';
            if (currentlyOn) {
                localStorage.removeItem('editMode');
                window.location.href = window.location.pathname;
            } else {
                localStorage.setItem('editMode', 'on');
                window.location.href = window.location.pathname + '?edit=true';
            }
        });
        document.body.appendChild(btn);

        // Badge
        var badge = document.createElement('div');
        badge.id = 'editModeBadge';
        badge.textContent = 'EDIT MODE';
        document.body.appendChild(badge);
    }

    // ----------------------------------------------------------
    // 2. Check if edit mode is active
    // ----------------------------------------------------------
    function isEditActive() {
        var params = new URLSearchParams(window.location.search);
        return params.get('edit') === 'true' ||
               document.body.hasAttribute('data-edit-active') ||
               localStorage.getItem('editMode') === 'on';
    }

    // ----------------------------------------------------------
    // 3. Build sidebar panel
    // ----------------------------------------------------------
    function buildPanel() {
        var meta = FIELD_META['pages/' + pageName] || {};
        var panel = document.createElement('div');
        panel.id = 'editPanel';
        panel.className = 'edit-panel active';
        panel.innerHTML =
            '<div class="edit-panel-header">' +
                '<h2>Edit Mode</h2>' +
                '<div class="edit-panel-page-hint">' + (meta._title || pageName) + '</div>' +
            '</div>' +
            '<div class="edit-tabs" id="editTabs"></div>' +
            '<div id="editSections"></div>' +
            '<div class="edit-save-bar">' +
                '<button class="edit-revert-btn" id="editRevertBtn">Revert</button>' +
                '<button class="edit-save-btn" id="editSaveBtn">Save Changes</button>' +
            '</div>' +
            '<div class="edit-status" id="editStatus"></div>';
        document.body.appendChild(panel);
        document.body.classList.add('edit-mode-on');

        document.getElementById('editSaveBtn').addEventListener('click', save);
        document.getElementById('editRevertBtn').addEventListener('click', revert);
    }

    // ----------------------------------------------------------
    // 4. Load content JSON files
    // ----------------------------------------------------------
    function loadContent() {
        var loads = [];
        loads.push(fetchContent('pages', pageName));
        if (pageName === 'home') {
            ['area-a', 'area-b', 'area-c', 'area-d'].forEach(function (a) {
                loads.push(fetchContent('areas', a));
            });
        }
        loads.push(fetchContent('media', 'captions'));
        loads.push(fetchContent('theme', 'typography'));
        loads.push(fetchContent('theme', 'spacing'));
        Promise.all(loads).then(function () {
            renderTabs();
            renderSections();
        });
    }

    function fetchContent(category, filename) {
        return fetch('/api/content/' + category + '/' + filename)
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (data && !data.error) {
                    contentCache[category + '/' + filename] = JSON.parse(JSON.stringify(data));
                }
            })
            .catch(function () {});
    }

    // ----------------------------------------------------------
    // 5. Render tabs
    // ----------------------------------------------------------
    function renderTabs() {
        var tabs = [{ id: 'page', label: 'Page Content' }];
        if (pageName === 'home') tabs.push({ id: 'areas', label: 'Areas' });
        tabs.push({ id: 'media', label: 'Images' });
        tabs.push({ id: 'theme', label: 'Theme' });

        var el = document.getElementById('editTabs');
        el.innerHTML = tabs.map(function (t, i) {
            return '<button class="edit-tab' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
        }).join('');
        el.addEventListener('click', function (e) {
            var tab = e.target.closest('[data-tab]');
            if (!tab) return;
            switchTab(tab.getAttribute('data-tab'));
        });
    }

    function switchTab(tabId) {
        document.querySelectorAll('.edit-tab').forEach(function (t) {
            t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
        });
        document.querySelectorAll('.edit-section').forEach(function (s) {
            s.classList.toggle('active', s.id === 'editSection-' + tabId);
        });
    }

    // ----------------------------------------------------------
    // 6. Render sections with structured groups
    // ----------------------------------------------------------
    function renderSections() {
        var c = document.getElementById('editSections');
        var html = '';

        // Page content tab
        html += '<div class="edit-section active" id="editSection-page">';
        html += renderStructuredGroups('pages/' + pageName, FIELD_META['pages/' + pageName] || null);
        html += '</div>';

        // Areas tab (home only)
        if (pageName === 'home') {
            html += '<div class="edit-section" id="editSection-areas">';
            ['area-a', 'area-b', 'area-c', 'area-d'].forEach(function (a) {
                html += renderAreaGroup('areas/' + a);
            });
            html += '</div>';
        }

        // Media tab
        html += '<div class="edit-section" id="editSection-media">';
        html += renderMediaGroup();
        html += '</div>';

        // Theme tab
        html += '<div class="edit-section" id="editSection-theme">';
        html += renderGenericGroup('theme/typography', 'Typography');
        html += renderGenericGroup('theme/spacing', 'Spacing');
        html += '</div>';

        c.innerHTML = html;

        // Wire up collapsible group headers
        c.querySelectorAll('.edit-group-header').forEach(function (h) {
            h.addEventListener('click', function () {
                h.parentElement.classList.toggle('collapsed');
            });
        });

        // Wire up image path change -> preview reload
        c.querySelectorAll('input[data-is-image="true"]').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var preview = inp.parentElement.querySelector('.edit-img-preview img');
                if (preview) preview.src = inp.value;
            });
        });
    }

    function renderStructuredGroups(cacheKey, meta) {
        var data = contentCache[cacheKey];
        if (!data) return '<div class="edit-group"><div class="edit-group-header"><span class="edit-group-title">No content loaded</span></div></div>';
        if (!meta) return renderGenericGroup(cacheKey, cacheKey);

        var html = '';
        Object.keys(data).forEach(function (sectionKey) {
            if (sectionKey === '_meta') return;
            var val = data[sectionKey];
            if (typeof val !== 'object' || val === null) return;

            var sectionMeta = meta[sectionKey] || {};
            var sectionTitle = sectionMeta._section || formatLabel(sectionKey);

            html += '<div class="edit-group">';
            html += '<div class="edit-group-header"><span class="edit-group-title">' + esc(sectionTitle) + '</span><span class="edit-group-arrow">V</span></div>';
            html += '<div class="edit-group-body">';

            Object.keys(val).forEach(function (fieldKey) {
                if (typeof val[fieldKey] !== 'string') return;
                var fm = sectionMeta[fieldKey] || {};
                html += buildField(cacheKey, sectionKey + '.' + fieldKey, fm.label || formatLabel(fieldKey), fm.hint || '', val[fieldKey]);
            });

            html += '</div></div>';
        });
        return html;
    }

    function renderAreaGroup(cacheKey) {
        var data = contentCache[cacheKey];
        if (!data) return '';
        var areaLetter = (data.label || cacheKey).replace('AREA ', '').replace('areas/', '').toUpperCase();
        var title = AREA_META._section_prefix + areaLetter + ' -- ' + (data.name || '');

        var html = '<div class="edit-group">';
        html += '<div class="edit-group-header"><span class="edit-group-title">' + esc(title) + '</span><span class="edit-group-arrow">V</span></div>';
        html += '<div class="edit-group-body">';
        ['name', 'description', 'interventions', 'image'].forEach(function (key) {
            if (data[key] === undefined) return;
            var fm = AREA_META[key] || {};
            html += buildField(cacheKey, key, fm.label || formatLabel(key), fm.hint || '', data[key]);
        });
        html += '</div></div>';
        return html;
    }

    function renderMediaGroup() {
        var data = contentCache['media/captions'];
        if (!data) return '<div class="edit-group"><div class="edit-group-header"><span class="edit-group-title">No media data</span></div></div>';

        var html = '';
        Object.keys(data).forEach(function (key) {
            if (key === '_meta') return;
            var item = data[key];
            if (typeof item !== 'object') return;

            html += '<div class="edit-group">';
            html += '<div class="edit-group-header"><span class="edit-group-title">' + formatLabel(key) + '</span><span class="edit-group-arrow">V</span></div>';
            html += '<div class="edit-group-body">';

            if (item.path) {
                html += buildField('media/captions', key + '.path', 'Image Path', 'File path to this image', item.path);
            }
            if (item.alt) {
                html += buildField('media/captions', key + '.alt', 'Alt Text', 'Accessibility description', item.alt);
            }
            if (item.caption) {
                html += buildField('media/captions', key + '.caption', 'Caption', 'Caption displayed below the image', item.caption);
            }

            html += '</div></div>';
        });
        return html;
    }

    function renderGenericGroup(cacheKey, title) {
        var data = contentCache[cacheKey];
        if (!data) return '';
        var html = '<div class="edit-group">';
        html += '<div class="edit-group-header"><span class="edit-group-title">' + esc(title) + '</span><span class="edit-group-arrow">V</span></div>';
        html += '<div class="edit-group-body">';
        Object.keys(data).forEach(function (key) {
            if (key === '_meta') return;
            var val = data[key];
            if (typeof val === 'string') {
                html += buildField(cacheKey, key, formatLabel(key), '', val);
            }
        });
        html += '</div></div>';
        return html;
    }

    // ----------------------------------------------------------
    // 7. Build a single field (with image preview if applicable)
    // ----------------------------------------------------------
    function buildField(cacheKey, fieldPath, label, hint, value) {
        var inputId = 'ef-' + cacheKey.replace(/\//g, '-') + '-' + fieldPath.replace(/\./g, '-');
        var isImage = /image|path|hero_image/.test(fieldPath.toLowerCase()) && value.indexOf('/static/') === 0;
        var isLong = value.length > 100;

        var html = '<div class="edit-field">';
        html += '<label for="' + inputId + '">' + esc(label) + '</label>';
        if (hint) html += '<div class="edit-field-hint">' + esc(hint) + '</div>';

        if (isLong) {
            html += '<textarea id="' + inputId + '" data-cache="' + cacheKey + '" data-path="' + fieldPath + '">' + esc(value) + '</textarea>';
        } else {
            html += '<input type="text" id="' + inputId + '" data-cache="' + cacheKey + '" data-path="' + fieldPath + '" value="' + escAttr(value) + '"' + (isImage ? ' data-is-image="true"' : '') + '>';
        }

        if (isImage) {
            var filename = value.split('/').pop();
            html += '<div class="edit-img-preview">';
            html += '<img src="' + escAttr(value) + '" alt="preview" onerror="this.style.display=\'none\'">';
            html += '<div class="edit-img-preview-info">' + esc(filename) + '</div>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // ----------------------------------------------------------
    // 8. Save
    // ----------------------------------------------------------
    function save() {
        var btn = document.getElementById('editSaveBtn');
        btn.textContent = 'Saving...';
        btn.className = 'edit-save-btn saving';
        btn.disabled = true;

        // Collect values from all fields
        var touched = {};
        document.querySelectorAll('[data-cache][data-path]').forEach(function (el) {
            var ck = el.getAttribute('data-cache');
            var path = el.getAttribute('data-path');
            var val = el.value;
            setNested(contentCache[ck], path, val);
            touched[ck] = true;
        });

        var keys = Object.keys(touched);
        if (keys.length === 0) {
            btn.textContent = 'No Changes';
            btn.className = 'edit-save-btn';
            btn.disabled = false;
            return;
        }

        var promises = keys.map(function (ck) {
            var parts = ck.split('/');
            return fetch('/api/content/' + parts[0] + '/' + parts[1], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentCache[ck])
            }).then(function (r) { return r.json(); });
        });

        Promise.all(promises)
            .then(function (results) {
                var ok = results.every(function (r) { return r.success; });
                if (ok) {
                    btn.textContent = 'Saved -- Reloading...';
                    btn.className = 'edit-save-btn saved';
                    setStatus('Saved. Reloading...');
                    setTimeout(function () {
                        window.location.href = window.location.pathname + '?edit=true';
                    }, 600);
                } else {
                    btn.textContent = 'Save Error';
                    btn.className = 'edit-save-btn error';
                    btn.disabled = false;
                    setStatus('Some saves failed.');
                    console.error('Save results:', results);
                }
            })
            .catch(function (err) {
                btn.textContent = 'Save Failed';
                btn.className = 'edit-save-btn error';
                btn.disabled = false;
                setStatus('Network error.');
                console.error(err);
            });
    }

    // ----------------------------------------------------------
    // 9. Revert
    // ----------------------------------------------------------
    function revert() {
        if (!confirm('Revert all unsaved changes?')) return;
        contentCache = {};
        loadContent();
        setStatus('Reverted to saved content.');
    }

    // ----------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------
    function setNested(obj, path, value) {
        var parts = path.split('.');
        var t = obj;
        for (var i = 0; i < parts.length - 1; i++) {
            if (!t[parts[i]]) t[parts[i]] = {};
            t = t[parts[i]];
        }
        t[parts[parts.length - 1]] = value;
    }

    function formatLabel(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function escAttr(s) {
        return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function setStatus(msg) {
        var el = document.getElementById('editStatus');
        if (el) el.textContent = msg;
    }

    // ----------------------------------------------------------
    // INIT
    // ----------------------------------------------------------
    injectToggleButton();

    if (isEditActive()) {
        // Sync localStorage
        localStorage.setItem('editMode', 'on');
        // Update toggle button state
        var tb = document.getElementById('editToggleBtn');
        if (tb) { tb.textContent = 'Exit Edit Mode'; tb.classList.add('active'); }

        buildPanel();
        loadContent();
    }
})();
