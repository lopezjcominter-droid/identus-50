    // =====================================================================
    // AUTH MODULE: login gate, roles, user management (admin)
    // Inactive until AUTH_REQUIRED = true (or open the page with ?login=1 to test).
    // =====================================================================
    (function () {
      const AUTH_REQUIRED = !LOCAL_PROJECT_MODE;
      const $ = id => document.getElementById(id);
      const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      // Local preview uses a safe admin test account so user/role controls
      // remain available before Supabase authentication is connected.
      window.userRole = LOCAL_PROJECT_MODE ? 'admin' : null;
      window.userName = LOCAL_PROJECT_MODE ? (localStorage.getItem('cfg_user_name') || 'Carlos') : '';
      window.localSignedOut = false;
      window.authSessionUser = null;
      window.authNoProjectAccess = false;
      window.authIsActive = () => AUTH_REQUIRED || /[?&]login=1/.test(location.search);
      window.getAccessToken = async () => { try { const { data } = await sbClient.auth.getSession(); return (data && data.session && data.session.access_token) || null; } catch (e) { return null; } };

      function normalizeRole(role) {
        const value = String(role || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
        if (value === 'supervisor' || value === 'project manager' || value === 'projectmanager' || value === 'project lead' || value === 'pm') return 'pm';
        if (value === 'administrator') return 'admin';
        if (value === 'qa inspector' || value === 'inspection') return 'inspector';
        if (value === 'read only' || value === 'readonly') return 'viewer';
        return ['admin', 'pm', 'inspector', 'viewer'].includes(value) ? value : 'viewer';
      }

      function roleLabel(role) {
        return ({ admin: 'Admin', pm: 'PM', inspector: 'Inspector', viewer: 'Viewer' })[normalizeRole(role)] || 'Viewer';
      }

      function showLogin(message) {
        return new Promise(resolve => {
          const ov = document.createElement('div');
          ov.style.cssText = 'position:fixed;inset:0;z-index:200000;background:#0B2A4A;display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Plus Jakarta Sans",Arial,sans-serif;';
          ov.innerHTML = `<form style="background:#fff;border-radius:14px;padding:28px;width:100%;max-width:360px;box-shadow:0 20px 50px rgba(0,0,0,.4);">
            <div style="font-size:22px;font-weight:700;color:#0B5394;">Identus 50</div>
            <div style="font-size:13px;color:#6B7280;margin:2px 0 18px;">QA/QC Inspection System — sign in</div>
            <label style="font-size:12px;font-weight:600;color:#374151;">Email</label>
            <input id="lgEmail" type="email" autocomplete="username" required style="width:100%;padding:11px;border:1px solid #D1D5DB;border-radius:8px;font-size:15px;margin:4px 0 12px;box-sizing:border-box;">
            <label style="font-size:12px;font-weight:600;color:#374151;">Password</label>
            <input id="lgPass" type="password" autocomplete="current-password" required style="width:100%;padding:11px;border:1px solid #D1D5DB;border-radius:8px;font-size:15px;margin:4px 0 12px;box-sizing:border-box;">
            <div id="lgMsg" style="min-height:18px;font-size:12px;color:#B91C1C;margin-bottom:8px;">${esc(message || '')}</div>
            <button id="lgBtn" type="submit" style="width:100%;padding:12px;border:none;border-radius:8px;background:#1E40AF;color:#fff;font-size:15px;font-weight:700;cursor:pointer;">Sign in</button>
            <div style="font-size:11px;color:#9CA3AF;margin-top:12px;text-align:center;">Forgot your password? Ask your administrator.</div></form>`;
          document.body.appendChild(ov);
          const f = ov.querySelector('form'); ov.querySelector('#lgEmail').focus();
          f.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = ov.querySelector('#lgBtn'), msg = ov.querySelector('#lgMsg');
            btn.disabled = true; btn.textContent = 'Signing in…'; msg.textContent = '';
            const { error } = await sbClient.auth.signInWithPassword({ email: ov.querySelector('#lgEmail').value.trim(), password: ov.querySelector('#lgPass').value });
            if (error) { msg.textContent = 'Incorrect email or password.'; btn.disabled = false; btn.textContent = 'Sign in'; return; }
            ov.remove(); resolve();
          });
        });
      }

      async function loadProfile() {
        const { data: { session } } = await sbClient.auth.getSession();
        if (!session) return null;
        window.authSessionUser = session.user;
        const [{ data: p, error: profileError }, { data: membership, error: membershipError }] = await Promise.all([
          sbClient.from('profiles').select('name,role').eq('user_id', session.user.id).maybeSingle(),
          sbClient.from('project_members').select('role').eq('project_id', PROJECT_ID).eq('user_id', session.user.id).maybeSingle()
        ]);
        if (profileError && membershipError) {
          console.warn('Could not load profile or project access:', profileError, membershipError);
          return null;
        }
        return {
          name: p?.name || session.user.user_metadata?.name || session.user.email || '',
          // Access is per project: the project role decides. Without one, only
          // a global admin may enter (to manage the project); anyone else has
          // no access. If the membership lookup itself failed, keep the
          // previous behaviour instead of locking people out on a bad network.
          role: membership?.role || (membershipError ? (p?.role || '') : (String(p?.role || '').trim().toLowerCase() === 'admin' ? 'admin' : '')),
          projectRole: membership?.role || ''
        };
      }

      window.authGate = async function () {
        if (!window.authIsActive()) {
          // The local preview has no Supabase session, but it still needs to
          // repaint the admin identity after the main initializer runs. The
          // older local label listener otherwise overwrites it with “change”.
          if (LOCAL_PROJECT_MODE && typeof window.updateUserLabel === 'function') window.updateUserLabel();
          return;
        }
        let msg = '';
        const { data: { session } } = await sbClient.auth.getSession();
        if (!session) await showLogin(msg);
        const p = await loadProfile();
        if (p && p.role) {
          window.userRole = normalizeRole(p.role);
          window.userName = p.name || '';
          window.authNoProjectAccess = false;
        } else {
          // Keep the signed-in session usable enough to sign out or retry.
          // Do not grant write access when the profile/project membership is missing.
          window.userRole = 'viewer';
          window.userName = window.authSessionUser?.email || 'Signed-in user';
          window.authNoProjectAccess = true;
          // Block the project screens: this user was not given access to it.
          if (!document.getElementById('noProjectAccessOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'noProjectAccessOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:100050;background:#F8FAFC;display:flex;align-items:center;justify-content:center;padding:16px;';
            overlay.innerHTML = '<div style="max-width:420px;background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:24px;text-align:center;font-family:inherit;"><h2 style="font-size:18px;margin:0 0 8px;color:#111827;">No project access</h2><p style="font-size:14px;color:#4B5563;margin:0 0 16px;">Your account does not have access to this project. Ask an administrator to add you.</p><button type="button" id="noProjectAccessSignOut" style="padding:9px 16px;border:none;background:#1E3A8A;color:#fff;border-radius:7px;cursor:pointer;font-weight:600;">Sign out</button></div>';
            document.body.appendChild(overlay);
            overlay.querySelector('#noProjectAccessSignOut').onclick = async () => { try { await sbClient.auth.signOut(); } catch (_) {} location.reload(); };
          }
        }
        // Production identity comes from Supabase Auth/profile only. Keep
        // the browser name cache strictly inside the explicit local preview.
        if (window.userName && LOCAL_PROJECT_MODE) localStorage.setItem('cfg_user_name', window.userName);
        applyRole(); window.updateUserLabel();
        sbClient.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.reload(); });
        // A password set or reset by an admin is temporary: ask for a personal one.
        try { const { data: { user } } = await sbClient.auth.getUser(); if (user?.user_metadata?.must_change_password) window.openChangePassword(true); } catch (_) {}
      };

      function applyRole() {
        const r = window.userRole; if (!r) return;
        document.body.classList.add('role-' + r);
        const st = document.createElement('style');
        const hideViewer = ['[onclick*="restoreInput"]', '[onclick*="clearAllData"]', '[onclick*="promptSetupPassword"]', '[onclick*="openAddUnitModal"]', '[onclick*="openQuickAddModal"]', '[onclick*="openAddEventModal"]', '[onclick*="openCreateEventModal"]', '[onclick*="deleteUnitPhoto"]', '[onclick*="deletePunchPhoto"]', '[onclick*="undoLastEvent"]', '.btn-edit', '.btn-delete'];
        const hideInspector = ['[onclick*="restoreInput"]', '[onclick*="clearAllData"]', '[onclick*="promptSetupPassword"]', '[onclick*="openAddUnitModal"]', '.btn-delete'];
        const hidePm = ['[onclick*="restoreInput"]', '[onclick*="clearAllData"]', '[onclick*="backupData"]'];
        st.textContent = `body.role-viewer :is(${hideViewer.join(',')}){display:none!important}body.role-inspector :is(${hideInspector.join(',')}){display:none!important}body.role-pm :is(${hidePm.join(',')}){display:none!important}`;
        document.head.appendChild(st);
      }

      // Header line: name, role, sign out, manage users
      async function performSignOut() {
        const localAdmin = typeof LOCAL_PROJECT_MODE !== 'undefined' && LOCAL_PROJECT_MODE;
        if (localAdmin) {
          // Local preview has no Supabase session. Still make Sign out a real,
          // reversible session action without deleting project data/configuration.
          window.localSignedOut = true;
          window.userName = '';
          window.userRole = 'viewer';
          window.authSessionUser = null;
          window.authNoProjectAccess = false;
          updateUserLabel();
          if (typeof toast === 'function') toast('Signed out of the local preview.');
          return;
        }
        try {
          if (typeof sbClient !== 'undefined' && sbClient?.auth) await sbClient.auth.signOut();
        } catch (error) {
          console.warn('Sign out request failed; clearing the client session locally:', error);
        } finally {
          // Supabase normally clears this itself. Remove only auth/session
          // artifacts as a safe fallback; never clear project data.
          try {
            Object.keys(localStorage).filter(key => /^sb-.+-auth-token$/.test(key) || key === 'supabase.auth.token').forEach(key => localStorage.removeItem(key));
            sessionStorage.clear();
          } catch (_) {}
          window.authSessionUser = null;
          window.userName = '';
          window.userRole = null;
          location.reload();
        }
      }

      // Every user can change their own password. When forced (temporary
      // password from an admin) the dialog cannot be closed until it is changed.
      window.openChangePassword = function (forced) {
        if ($('pwModal')) return;
        const ov = document.createElement('div'); ov.id = 'pwModal';
        ov.style.cssText = 'position:fixed;inset:0;z-index:100060;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;padding:16px;';
        ov.innerHTML = `<form style="background:#fff;border-radius:12px;padding:22px;width:100%;max-width:360px;box-shadow:0 20px 50px rgba(0,0,0,.3);">
          <h2 style="font-size:17px;margin:0 0 6px;">🔑 ${forced ? 'Create your own password' : 'Change password'}</h2>
          <p style="font-size:12px;color:#64748B;margin:0 0 12px;">${forced ? 'You signed in with a temporary password. Choose a new one to continue.' : 'At least 8 characters.'}</p>
          <input type="password" id="pwNew" autocomplete="new-password" placeholder="New password" minlength="8" required style="width:100%;padding:10px;border:1px solid #D1D5DB;border-radius:6px;margin-bottom:8px;box-sizing:border-box;">
          <input type="password" id="pwNew2" autocomplete="new-password" placeholder="Repeat new password" minlength="8" required style="width:100%;padding:10px;border:1px solid #D1D5DB;border-radius:6px;margin-bottom:8px;box-sizing:border-box;">
          <div id="pwMsg" style="min-height:18px;font-size:12px;color:#B91C1C;margin-bottom:8px;"></div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">${forced ? '' : '<button type="button" id="pwCancel" style="padding:8px 14px;border:1px solid #D1D5DB;background:#fff;border-radius:6px;cursor:pointer;">Cancel</button>'}
          <button type="submit" id="pwSave" style="padding:8px 14px;border:none;background:#1E40AF;color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Save password</button></div></form>`;
        document.body.appendChild(ov);
        if ($('pwCancel')) $('pwCancel').onclick = () => ov.remove();
        $('pwNew').focus();
        ov.querySelector('form').onsubmit = async ev => {
          ev.preventDefault();
          const a = $('pwNew').value, b = $('pwNew2').value;
          if (a.length < 8) { $('pwMsg').textContent = 'Use at least 8 characters.'; return; }
          if (a !== b) { $('pwMsg').textContent = 'The two passwords do not match.'; return; }
          $('pwSave').disabled = true; $('pwSave').textContent = 'Saving…';
          const { error } = await sbClient.auth.updateUser({ password: a, data: { must_change_password: false } });
          if (error) { $('pwSave').disabled = false; $('pwSave').textContent = 'Save password'; $('pwMsg').textContent = /different|same/i.test(error.message) ? 'Choose a password different from the temporary one.' : error.message; return; }
          ov.remove(); if (typeof toast === 'function') toast('✅ Password changed');
        };
      };

      window.updateUserLabel = function () {
        const el = $('userLabel'); if (!el) return;
        const localAdmin = typeof LOCAL_PROJECT_MODE !== 'undefined' && LOCAL_PROJECT_MODE;
        if (localAdmin) {
          if (window.localSignedOut) {
            el.innerHTML = `Signed out (local preview) · <a href="#" id="lnkIn" style="color:#1E40AF;">Sign in</a>`;
            $('lnkIn').onclick = e => { e.preventDefault(); window.localSignedOut = false; window.userRole = 'admin'; window.userName = localStorage.getItem('cfg_user_name') || 'Carlos'; updateUserLabel(); };
            return;
          }
          const name = esc(localStorage.getItem('cfg_user_name') || window.userName || 'Carlos');
          el.innerHTML = `👤 ${name} (admin) · <a href="#" id="lnkOut" style="color:#1E40AF;">Sign out</a> · <a href="#" id="lnkUsers" style="color:#1E40AF;">👥 Users</a>`;
          $('lnkOut').onclick = async e => { e.preventDefault(); await performSignOut(); };
          $('lnkUsers').onclick = e => { e.preventDefault(); openUsers(); };
          return;
        }
        if (!window.authIsActive()) { el.innerHTML = `👤 ${esc(localStorage.getItem('cfg_user_name') || 'No name set')} · <a href="#" onclick="changeUserName();return false;" style="color:#1E40AF;">change</a>`; return; }
        const accessText = window.authNoProjectAccess ? ' <span style="color:#B45309;">(No project access)</span>' : ` <span style="color:#6B7280;">(${roleLabel(window.userRole)})</span>`;
        el.innerHTML = `👤 ${esc(window.userName || window.authSessionUser?.email || 'Signed-in user')}${accessText} · <a href="#" id="lnkPw" style="color:#1E40AF;">🔑 Password</a> · <a href="#" id="lnkOut" style="color:#1E40AF;">Sign out</a>` + (window.userRole === 'admin' && !window.authNoProjectAccess ? ` · <a href="#" id="lnkUsers" style="color:#1E40AF;">👥 Users</a>` : '');
        $('lnkOut').onclick = async e => { e.preventDefault(); await performSignOut(); };
        if ($('lnkPw')) $('lnkPw').onclick = e => { e.preventDefault(); window.openChangePassword(false); };
        if ($('lnkUsers')) $('lnkUsers').onclick = e => { e.preventDefault(); openUsers(); };
      };

      // ---------- Users management (admin) ----------
      async function adminCall(action, payload) {
        if (LOCAL_PROJECT_MODE) {
          const key = 'local_users'; const p = payload || {};
          let users = [];
          try { users = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { users = []; }
          if (!users.length) users = [{ id: 'local-admin', name: localStorage.getItem('cfg_user_name') || 'Carlos', email: 'admin@local.test', role: 'admin', disabled: false }];
          if (action === 'list') {
            users = users.map(u => ({ ...u, role: normalizeRole(u.role), projectRole: u.projectRole ? normalizeRole(u.projectRole) : normalizeRole(u.role) }));
            localStorage.setItem(key, JSON.stringify(users));
            return { users, memberships: users.map(u => ({ user_id: u.id, role: u.projectRole })), me: 'local-admin' };
          }
          if (action === 'create') {
            if (!String(p.name || '').trim() || !String(p.email || '').trim() || String(p.password || '').length < 8) throw new Error('Enter a name, email, and a password of at least 8 characters.');
            if (users.some(u => u.email.toLowerCase() === String(p.email).trim().toLowerCase())) throw new Error('A user with this email already exists.');
            users.push({ id: 'local-' + Date.now(), name: String(p.name).trim(), email: String(p.email).trim(), role: normalizeRole(p.role || 'inspector'), disabled: false });
          } else if (action === 'setRole') {
            const u = users.find(x => x.id === p.id); if (!u) throw new Error('User not found.'); if (u.id === 'local-admin') throw new Error('The local admin role cannot be changed.'); u.role = normalizeRole(p.role);
          } else if (action === 'setMembership') {
            const u = users.find(x => x.id === p.userId); if (!u) throw new Error('User not found.'); u.projectRole = p.role === 'none' ? null : normalizeRole(p.role);
          } else if (action === 'setActive') {
            const u = users.find(x => x.id === p.id); if (!u) throw new Error('User not found.'); u.disabled = !p.active;
          } else if (action === 'delete') {
            users = users.filter(u => u.id !== p.id && u.id !== 'local-admin');
          } else if (action === 'resetPassword' && String(p.password || '').length < 8) {
            throw new Error('Password must have at least 8 characters.');
          }
          localStorage.setItem(key, JSON.stringify(users)); return { users, me: 'local-admin' };
        }
        const token = await window.getAccessToken();
        const res = await proxyFetch('/.netlify/functions/admin-users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ action, ...(payload || {}) }) });
        let body = {}; try { body = await res.json(); } catch (e) {}
        if (!res.ok) throw new Error(body.error || ('Error ' + res.status));
        return body;
      }
      async function openUsers() {
        let ov = $('usersModal'); if (ov) ov.remove();
        ov = document.createElement('div'); ov.id = 'usersModal';
        ov.style.cssText = 'position:fixed;inset:0;z-index:90000;background:rgba(0,0,0,.5);display:flex;align-items:flex-start;justify-content:center;padding:24px 12px;overflow:auto;';
        ov.innerHTML = `<div style="background:#fff;border-radius:12px;width:100%;max-width:820px;padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2 style="font-size:18px;margin:0;">👥 Users</h2><span style="flex:1"></span><button type="button" class="btn btn-secondary" style="font-size:12px;padding:6px 10px;margin-right:8px;" onclick="window.openUserActivity && window.openUserActivity()">📊 User Activity</button><button id="uClose" style="border:none;background:none;font-size:22px;cursor:pointer;">✕</button></div>
          <div id="uMsg" style="min-height:18px;font-size:13px;margin-bottom:8px;"></div>
          <div id="uList" style="overflow-x:auto;">Loading…</div>
          <h3 style="font-size:14px;margin:18px 0 8px;">Add user</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <input id="uName" placeholder="Full name" style="flex:1;min-width:140px;padding:9px;border:1px solid #D1D5DB;border-radius:6px;">
            <input id="uEmail" type="email" placeholder="Email" style="flex:1;min-width:180px;padding:9px;border:1px solid #D1D5DB;border-radius:6px;">
            <input id="uPass" type="text" placeholder="Temporary password (8+ chars)" style="flex:1;min-width:180px;padding:9px;border:1px solid #D1D5DB;border-radius:6px;">
            <select id="uRole" style="padding:9px;border:1px solid #D1D5DB;border-radius:6px;"><option value="inspector">Inspector</option><option value="pm">PM</option><option value="viewer">Viewer (read only)</option><option value="admin">Admin</option></select>
            <button id="uAdd" style="padding:9px 16px;border:none;background:#1E40AF;color:#fff;border-radius:6px;font-weight:600;cursor:pointer;">Add</button>
          </div>
            <p style="font-size:11px;color:#6B7280;margin-top:10px;">Admin: everything. PM: manage project follow-up, RFI drawings, and reports. Inspector: log inspections, events, and photos. Viewer: read only.</p></div>`;
        document.body.appendChild(ov);
        const msg = (t, ok) => { const m = $('uMsg'); m.style.color = ok ? '#047857' : '#B91C1C'; m.textContent = t; };
        $('uClose').onclick = () => ov.remove();
        async function refresh() {
          try {
            const { users, memberships = [], me } = await adminCall('list', { projectId: PROJECT_ID });
            const membershipByUser = Object.fromEntries(memberships.map(m => [m.user_id, normalizeRole(m.role)]));
            $('uList').innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px;"><tr style="background:#F3F4F6;text-align:left;"><th style="padding:7px;">Name</th><th>Email</th><th>Global role</th><th>Current project</th><th>Status</th><th></th></tr>${users.map(u => `<tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:7px;">${esc(u.name)}</td><td>${esc(u.email)}</td>
        <td><select data-role="${u.id}" ${u.id === me ? 'disabled' : ''} style="padding:4px;">${['admin', 'pm', 'inspector', 'viewer'].map(r => `<option value="${r}" ${normalizeRole(u.role) === r ? 'selected' : ''}>${roleLabel(r)}</option>`).join('')}</select></td>
              <td><select data-project-role="${u.id}" style="padding:4px;"><option value="none" ${!membershipByUser[u.id] ? 'selected' : ''}>No access</option>${['admin', 'pm', 'inspector', 'viewer'].map(r => `<option value="${r}" ${membershipByUser[u.id] === r ? 'selected' : ''}>${roleLabel(r)}</option>`).join('')}</select></td>
              <td>${u.disabled ? '<span style="color:#B91C1C;">Disabled</span>' : 'Active'}</td>
              <td style="white-space:nowrap;"><button data-pw="${u.id}" style="padding:4px 8px;font-size:12px;cursor:pointer;">Reset password</button> ${u.id === me ? '' : `<button data-act="${u.id}" data-on="${u.disabled ? 1 : 0}" style="padding:4px 8px;font-size:12px;cursor:pointer;">${u.disabled ? 'Enable' : 'Disable'}</button> <button data-del="${u.id}" data-name="${esc(u.name)}" style="padding:4px 8px;font-size:12px;cursor:pointer;background:#EF4444;color:#fff;border:none;border-radius:4px;">Delete</button>`}</td></tr>`).join('')}</table>`;
            $('uList').querySelectorAll('select[data-role]').forEach(s => s.onchange = async () => { try { await adminCall('setRole', { id: s.dataset.role, role: s.value }); msg('Role updated', true); } catch (e) { msg(e.message); refresh(); } });
            $('uList').querySelectorAll('select[data-project-role]').forEach(s => s.onchange = async () => { try { await adminCall('setMembership', { userId: s.dataset.projectRole, projectId: PROJECT_ID, role: s.value }); msg('Project access updated', true); refresh(); } catch (e) { msg(e.message); refresh(); } });
            $('uList').querySelectorAll('button[data-act]').forEach(b => b.onclick = async () => { try { await adminCall('setActive', { id: b.dataset.act, active: b.dataset.on === '1' }); msg('Status updated', true); refresh(); } catch (e) { msg(e.message); } });
            $('uList').querySelectorAll('button[data-del]').forEach(b => b.onclick = async () => { if (!confirm(`Delete user "${b.dataset.name}"? This cannot be undone.`)) return; try { await adminCall('delete', { id: b.dataset.del }); msg('User deleted', true); refresh(); } catch (e) { msg(e.message); } });
            $('uList').querySelectorAll('button[data-pw]').forEach(b => b.onclick = async () => { const np = await (window.askText ? window.askText('New password for this user (8+ characters)', 'New password') : null); if (!np) return; try { await adminCall('resetPassword', { id: b.dataset.pw, password: np }); msg('Password changed', true); } catch (e) { msg(e.message); } });
          } catch (e) { $('uList').textContent = e.message; }
        }
        $('uAdd').onclick = async () => {
          try {
            await adminCall('create', { name: $('uName').value, email: $('uEmail').value, password: $('uPass').value, role: normalizeRole($('uRole').value), projectId: PROJECT_ID });
            ['uName', 'uEmail', 'uPass'].forEach(i => $(i).value = ''); msg('User created', true); refresh();
          } catch (e) { msg(e.message); }
        };
        refresh();
      }
      // This auth module is parsed after the main initializer. Repaint the
      // local admin header even when init() already ran before authGate existed.
      if (LOCAL_PROJECT_MODE) {
        if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', () => window.updateUserLabel());
        else window.updateUserLabel();
      }
    })();
