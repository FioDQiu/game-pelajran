    <!-- ===================================================================== -->
    <!-- JAVASCRIPT ENGINE: AUDIO, MULTI-TAB SYNC, QUIZ & 2D TOWER PLATFORMER  -->
    <!-- ===================================================================== -->
    <script>
        /* ==========================================================================
           1. SOUND EFFECTS SYNTHESIZER (Web Audio API - Tanpa File Eksternal)
           ========================================================================== */
        const SoundFX = {
            ctx: null,
            muted: false,
            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            },
            playTone(freq, type, duration, vol = 0.15, slideTo = null) {
                if (this.muted) return;
                this.init();
                if (!this.ctx) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                if (slideTo) {
                    osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
                }
                gain.gain.setValueAtTime(vol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            },
            jump() {
                this.playTone(280, 'sine', 0.22, 0.18, 620);
            },
            noPoints() {
                this.playTone(180, 'sawtooth', 0.18, 0.12, 120);
            },
            correct() {
                this.playTone(523.25, 'triangle', 0.12, 0.2);
                setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.2), 90);
                setTimeout(() => this.playTone(783.99, 'triangle', 0.25, 0.22), 180);
            },
            wrong() {
                this.playTone(220, 'sawtooth', 0.18, 0.16, 180);
                setTimeout(() => this.playTone(165, 'sawtooth', 0.3, 0.16, 130), 150);
            },
            checkpoint() {
                this.playTone(440, 'sine', 0.1, 0.18);
                setTimeout(() => this.playTone(554.37, 'sine', 0.1, 0.18), 80);
                setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.18), 160);
                setTimeout(() => this.playTone(880, 'sine', 0.28, 0.2), 240);
            },
            respawn() {
                this.playTone(500, 'sine', 0.25, 0.16, 200);
            },
            victory() {
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((n, idx) => {
                    setTimeout(() => this.playTone(n, 'triangle', 0.28, 0.22), idx * 120);
                });
            }
        };

        function toggleMute() {
            SoundFX.muted = !SoundFX.muted;
            document.getElementById('btnMuteToggle').textContent = SoundFX.muted ? '🔇' : '🔊';
            showToast(SoundFX.muted ? 'Suara dimatikan' : 'Suara diaktifkan', 'info');
        }

        /* ==========================================================================
           2. TOAST NOTIFICATION SYSTEM (Pengganti alert() / confirm())
           ========================================================================== */
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            const colors = {
                info: 'bg-slate-800 border-indigo-400 text-white',
                success: 'bg-emerald-600 border-emerald-300 text-white',
                warning: 'bg-amber-500 border-amber-200 text-slate-950',
                error: 'bg-rose-600 border-rose-300 text-white'
            };
            toast.className = `px-4 py-3 rounded-2xl border-2 shadow-xl font-bold text-xs sm:text-sm text-center animate-pop ${colors[type] || colors.info}`;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 2600);
        }

        /* ==========================================================================
           3. DEFAULT BANK SOAL & QUIZIZZ-STYLE MEME DATA
           ========================================================================== */
        const DEFAULT_QUESTIONS = [
            {
                q: "Hewan darat tercepat di dunia yang mampu berlari hingga 110 km/jam adalah...",
                options: ["Singa", "Cheetah", "Kuda Balap", "Kanguru"],
                correct: 1
            },
            {
                q: "Planet terbesar di tata surya kita adalah...",
                options: ["Mars", "Saturnus", "Jupiter", "Neptunus"],
                correct: 2
            },
            {
                q: "Jika 15 + 27 × 0 = ..., berapakah hasilnya?",
                options: ["0", "42", "15", "27"],
                correct: 2
            },
            {
                q: "Pulau terbesar di Indonesia berdasarkan luas wilayahnya adalah...",
                options: ["Jawa", "Sumatra", "Sulawesi", "Kalimantan"],
                correct: 3
            },
            {
                q: "Zat hijau daun yang membantu tumbuhan melakukan fotosintesis disebut...",
                options: ["Klorofil", "Stomata", "Karbohidrat", "Oksigen"],
                correct: 0
            }
        ];

        const MEMES_CORRECT = [
            {
                headline: "MANTAP JIWA! +2 LOMPATAN!",
                subtext: "Otak encer banget! Gas langsung lompat ke puncak menara!",
                badge: "BENAR • +2 POIN LOMPAT",
                bg: "from-emerald-400 to-teal-600 border-emerald-200",
                svg: `<svg viewBox="0 0 120 120" class="w-28 h-28">
                        <circle cx="60" cy="60" r="46" fill="#FDE047" stroke="#1E293B" stroke-width="4"/>
                        <rect x="26" y="42" width="30" height="16" rx="4" fill="#0F172A"/>
                        <rect x="64" y="42" width="30" height="16" rx="4" fill="#0F172A"/>
                        <line x1="56" y1="48" x2="64" y2="48" stroke="#0F172A" stroke-width="4"/>
                        <path d="M 38 74 Q 60 95 82 74" fill="none" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
                        <text x="60" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="#FFF">😎 +2</text>
                      </svg>`
            },
            {
                headline: "IQ 200 DETECTED!",
                subtext: "Guru pasti bangga melihat kecepatan berpikirmu!",
                badge: "JENIUS • +2 POIN LOMPAT",
                bg: "from-amber-400 to-orange-500 border-amber-100",
                svg: `<svg viewBox="0 0 120 120" class="w-28 h-28">
                        <circle cx="60" cy="64" r="44" fill="#FDE047" stroke="#1E293B" stroke-width="4"/>
                        <polygon points="60,8 66,24 84,24 70,34 75,50 60,40 45,50 50,34 36,24 54,24" fill="#FFF" stroke="#0F172A" stroke-width="2"/>
                        <circle cx="44" cy="60" r="6" fill="#0F172A"/>
                        <circle cx="76" cy="60" r="6" fill="#0F172A"/>
                        <path d="M 42 78 Q 60 94 78 78 Z" fill="#F43F5E" stroke="#0F172A" stroke-width="3"/>
                      </svg>`
            },
            {
                headline: "AUTO JUARA KELAS!",
                subtext: "Jawaban tepat sasaran! Jangan kasih kendor, naik terus!",
                badge: "GACOR • +2 POIN LOMPAT",
                bg: "from-fuchsia-500 to-indigo-600 border-pink-200",
                svg: `<svg viewBox="0 0 120 120" class="w-28 h-28">
                        <path d="M60 15 L75 45 L108 50 L84 73 L90 105 L60 90 L30 105 L36 73 L12 50 L45 45 Z" fill="#FACC15" stroke="#0F172A" stroke-width="4"/>
                        <circle cx="50" cy="58" r="5" fill="#0F172A"/>
                        <circle cx="70" cy="58" r="5" fill="#0F172A"/>
                        <path d="M 48 72 Q 60 84 72 72" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
                      </svg>`
            }
        ];

        const MEMES_WRONG = [
            {
                headline: "YAH, KURANG TEPAT!",
                subtext: "Belum dapat poin lompatan nih. Tarik napas, coba soal berikutnya!",
                badge: "SALAH • 0 POIN",
                bg: "from-rose-500 to-red-700 border-rose-200",
                svg: `<svg viewBox="0 0 120 120" class="w-28 h-28">
                        <circle cx="60" cy="60" r="46" fill="#FDA4AF" stroke="#1E293B" stroke-width="4"/>
                        <path d="M 36 46 L 50 56 M 50 46 L 36 56" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
                        <path d="M 70 46 L 84 56 M 84 46 L 70 56" stroke="#0F172A" stroke-width="4" stroke-linecap="round"/>
                        <path d="M 40 84 Q 60 68 80 84" fill="none" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
                        <path d="M 86 62 Q 92 74 86 80 Q 80 74 86 62" fill="#38BDF8"/>
                      </svg>`
            },
            {
                headline: "NT (NICE TRY) BESTIE!",
                subtext: "Hampir aja bener! Jangan menyerah, klik soal lagi yuk!",
                badge: "COBA LAGI • 0 POIN",
                bg: "from-slate-600 to-slate-800 border-slate-400",
                svg: `<svg viewBox="0 0 120 120" class="w-28 h-28">
                        <circle cx="60" cy="60" r="46" fill="#CBD5E1" stroke="#1E293B" stroke-width="4"/>
                        <circle cx="44" cy="52" r="6" fill="#0F172A"/>
                        <circle cx="76" cy="52" r="6" fill="#0F172A"/>
                        <line x1="42" y1="78" x2="78" y2="74" stroke="#0F172A" stroke-width="5" stroke-linecap="round"/>
                        <text x="86" y="34" font-size="22" font-weight="bold" fill="#FDE047">?</text>
                      </svg>`
            }
        ];

        /* ==========================================================================
           4. ROOM & MULTI-TAB STATE MANAGEMENT (localStorage + storage event)
           ========================================================================== */
        const STORAGE_PREFIX = 'TOWER_OF_QUIZ_ROOM_';
        let currentRole = null; // 'teacher' | 'student' | 'solo'
        let currentRoomCode = null;
        let currentStudentId = null;
        let currentStudentName = 'Siswa';
        let syncInterval = null;

        function generateRandomRoomCode() {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        }

        function getRoomData(code) {
            if (!code) return null;
            try {
                const raw = localStorage.getItem(STORAGE_PREFIX + code.toUpperCase());
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        }

        function saveRoomData(code, data) {
            if (!code) return;
            try {
                localStorage.setItem(STORAGE_PREFIX + code.toUpperCase(), JSON.stringify(data));
            } catch (e) {
                console.error('Storage error', e);
            }
        }

        function switchView(viewId) {
            ['viewHome', 'viewLanding', 'viewTeacher', 'viewStudent'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
            document.getElementById(viewId).classList.remove('hidden');
        }

        function openGame1TowerOfQuiz() {
            SoundFX.init();
            switchView('viewLanding');
        }

        function backToHomePortal() {
            if (syncInterval) clearInterval(syncInterval);
            stopGameLoop();
            currentRole = null;
            currentRoomCode = null;
            document.getElementById('endGameModal').classList.add('hidden');
            document.getElementById('quizModal').classList.add('hidden');
            switchView('viewHome');
        }

        function leaveToLanding() {
            if (syncInterval) clearInterval(syncInterval);
            stopGameLoop();
            currentRole = null;
            currentRoomCode = null;
            document.getElementById('endGameModal').classList.add('hidden');
            document.getElementById('quizModal').classList.add('hidden');
            switchView('viewLanding');
        }

        // Listen for cross-tab storage changes (Guru <-> Siswa real-time sync!)
        window.addEventListener('storage', (e) => {
            if (!currentRoomCode) return;
            if (e.key === STORAGE_PREFIX + currentRoomCode) {
                if (currentRole === 'teacher') {
                    renderTeacherDashboard();
                } else if (currentRole === 'student') {
                    syncStudentWithRoom();
                }
            }
        });

        /* ==========================================================================
           5. TEACHER DASHBOARD LOGIC
           ========================================================================== */
        function createTeacherRoom() {
            SoundFX.init();
            const code = generateRandomRoomCode();
            currentRole = 'teacher';
            currentRoomCode = code;

            const initialRoom = {
                code: code,
                status: 'waiting', // 'waiting' | 'playing' | 'ended'
                durationSec: 180,
                endTime: null,
                questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
                students: {}
            };
            saveRoomData(code, initialRoom);

            document.getElementById('teacherRoomCodeDisplay').textContent = code;
            document.getElementById('inputTimerMinutes').value = 3;
            document.getElementById('inputTimerSeconds').value = 0;

            switchView('viewTeacher');
            renderTeacherDashboard();
            showToast(`Ruangan ${code} berhasil dibuat!`, 'success');

            if (syncInterval) clearInterval(syncInterval);
            syncInterval = setInterval(updateTeacherClockAndLeaderboard, 500);
        }

        function copyRoomCode() {
            if (!currentRoomCode) return;
            const tempInput = document.createElement('input');
            tempInput.value = currentRoomCode;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            showToast(`Kode ruangan "${currentRoomCode}" disalin ke clipboard!`, 'success');
        }

        function setQuickTimer(min, sec) {
            document.getElementById('inputTimerMinutes').value = min;
            document.getElementById('inputTimerSeconds').value = sec;
            updateTeacherTimerSetting();
        }

        function updateTeacherTimerSetting() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;
            const min = Math.max(0, parseInt(document.getElementById('inputTimerMinutes').value) || 0);
            const sec = Math.max(0, Math.min(59, parseInt(document.getElementById('inputTimerSeconds').value) || 0));
            const total = Math.max(15, min * 60 + sec);
            room.durationSec = total;
            if (room.status === 'playing') {
                room.endTime = Date.now() + total * 1000;
            }
            saveRoomData(currentRoomCode, room);
            updateTeacherClockAndLeaderboard();
            showToast(`Waktu diatur menjadi ${formatSeconds(total)}`, 'info');
        }

        function teacherStartGame() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;
            if (room.questions.length === 0) {
                showToast('Tambahkan minimal 1 soal sebelum memulai!', 'error');
                return;
            }
            SoundFX.checkpoint();
            room.status = 'playing';
            room.endTime = Date.now() + room.durationSec * 1000;
            saveRoomData(currentRoomCode, room);
            renderTeacherDashboard();
            showToast('Game dimulai! Siswa sekarang bisa memanjat menara!', 'success');
        }

        function teacherResetGame() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;
            room.status = 'waiting';
            room.endTime = null;
            Object.keys(room.students).forEach(id => {
                room.students[id].height = 0;
                room.students[id].points = 0;
                room.students[id].finished = false;
            });
            saveRoomData(currentRoomCode, room);
            renderTeacherDashboard();
            showToast('Sesi di-reset ke lobi tunggu.', 'warning');
        }

        function saveTeacherQuestion() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;

            const qText = document.getElementById('inputQuestionText').value.trim();
            const opts = [
                document.getElementById('optA').value.trim(),
                document.getElementById('optB').value.trim(),
                document.getElementById('optC').value.trim(),
                document.getElementById('optD').value.trim()
            ];
            const correctRadio = document.querySelector('input[name="correctOption"]:checked');
            const correctIdx = correctRadio ? parseInt(correctRadio.value) : 0;

            if (!qText || opts.some(o => !o)) {
                showToast('Harap isi teks pertanyaan dan keempat pilihan A, B, C, D!', 'error');
                return;
            }

            const editIdx = parseInt(document.getElementById('editQuestionIndex').value);
            const newQ = { q: qText, options: opts, correct: correctIdx };

            if (editIdx >= 0 && editIdx < room.questions.length) {
                room.questions[editIdx] = newQ;
                showToast('Soal berhasil diperbarui!', 'success');
            } else {
                room.questions.push(newQ);
                showToast('Soal baru berhasil ditambahkan!', 'success');
            }

            saveRoomData(currentRoomCode, room);
            resetQuestionForm();
            renderTeacherDashboard();
        }

        function editTeacherQuestion(idx) {
            const room = getRoomData(currentRoomCode);
            if (!room || !room.questions[idx]) return;
            const item = room.questions[idx];

            document.getElementById('editQuestionIndex').value = idx;
            document.getElementById('formQuestionTitle').textContent = `✏️ Edit Soal #${idx + 1}`;
            document.getElementById('btnCancelEditQuestion').classList.remove('hidden');

            document.getElementById('inputQuestionText').value = item.q;
            document.getElementById('optA').value = item.options[0];
            document.getElementById('optB').value = item.options[1];
            document.getElementById('optC').value = item.options[2];
            document.getElementById('optD').value = item.options[3];
            const radios = document.querySelectorAll('input[name="correctOption"]');
            if (radios[item.correct]) radios[item.correct].checked = true;
        }

        function deleteTeacherQuestion(idx) {
            const room = getRoomData(currentRoomCode);
            if (!room) return;
            room.questions.splice(idx, 1);
            saveRoomData(currentRoomCode, room);
            renderTeacherDashboard();
            showToast('Soal dihapus.', 'info');
        }

        function resetQuestionForm() {
            document.getElementById('editQuestionIndex').value = -1;
            document.getElementById('formQuestionTitle').textContent = '+ Tambah Soal Baru';
            document.getElementById('btnCancelEditQuestion').classList.add('hidden');
            document.getElementById('inputQuestionText').value = '';
            document.getElementById('optA').value = '';
            document.getElementById('optB').value = '';
            document.getElementById('optC').value = '';
            document.getElementById('optD').value = '';
            document.querySelector('input[name="correctOption"][value="0"]').checked = true;
        }

        function renderTeacherDashboard() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;

            // Update Status Badge
            const badge = document.getElementById('teacherStatusBadge');
            if (room.status === 'waiting') {
                badge.textContent = 'Menunggu Siswa';
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
            } else if (room.status === 'playing') {
                badge.textContent = 'Sedang Berlangsung';
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            } else {
                badge.textContent = 'Waktu Habis / Selesai';
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30';
            }

            // Render Question List
            document.getElementById('questionCountBadge').textContent = `${room.questions.length} Soal Aktif`;
            const qList = document.getElementById('teacherQuestionsList');
            qList.innerHTML = '';

            if (room.questions.length === 0) {
                qList.innerHTML = `<div class="text-center py-8 text-slate-500 text-sm">Belum ada soal. Tambahkan soal menggunakan formulir di atas.</div>`;
            } else {
                const letters = ['A', 'B', 'C', 'D'];
                room.questions.forEach((item, idx) => {
                    const card = document.createElement('div');
                    card.className = 'bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2';
                    card.innerHTML = `
                        <div class="flex items-start justify-between gap-2">
                            <p class="text-sm font-bold text-white"><span class="text-indigo-400 mr-1.5">#${idx + 1}</span>${escapeHtml(item.q)}</p>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button onclick="editTeacherQuestion(${idx})" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-300 font-bold cursor-pointer">Edit</button>
                                <button onclick="deleteTeacherQuestion(${idx})" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-xs text-rose-400 font-bold cursor-pointer">Hapus</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-xs">
                            ${item.options.map((opt, oIdx) => `
                                <div class="px-2.5 py-1 rounded-lg ${oIdx === item.correct ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-900 text-slate-400'}">
                                    ${letters[oIdx]}. ${escapeHtml(opt)} ${oIdx === item.correct ? '✓' : ''}
                                </div>
                            `).join('')}
                        </div>
                    `;
                    qList.appendChild(card);
                });
            }

            updateTeacherClockAndLeaderboard();
        }

        function updateTeacherClockAndLeaderboard() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;

            // Update Clock
            const clockEl = document.getElementById('teacherLiveClock');
            if (room.status === 'playing' && room.endTime) {
                const rem = Math.max(0, Math.ceil((room.endTime - Date.now()) / 1000));
                clockEl.textContent = formatSeconds(rem);
                if (rem === 0 && room.status === 'playing') {
                    room.status = 'ended';
                    saveRoomData(currentRoomCode, room);
                    renderTeacherDashboard();
                }
            } else {
                clockEl.textContent = formatSeconds(room.durationSec);
            }

            // Render Students
            const studentsArr = Object.values(room.students || {}).sort((a, b) => b.height - a.height);
            document.getElementById('studentCountBadge').textContent = `${studentsArr.length} Siswa`;

            const lbEl = document.getElementById('teacherLeaderboardList');
            if (studentsArr.length === 0) {
                lbEl.innerHTML = `<div class="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">Belum ada siswa yang bergabung ke ruangan ini.</div>`;
                return;
            }

            lbEl.innerHTML = studentsArr.map((st, idx) => `
                <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                        <span class="w-7 h-7 rounded-xl ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'} font-display font-bold text-xs flex items-center justify-center">
                            ${idx + 1}
                        </span>
                        <div>
                            <div class="font-bold text-sm text-white flex items-center gap-1.5">
                                ${escapeHtml(st.name)}
                                ${st.finished ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">FINIS 🏆</span>' : ''}
                            </div>
                            <div class="text-[11px] text-slate-400">Poin Lompat: <b class="text-amber-300">${st.points}</b></div>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="font-display font-bold text-emerald-400 text-base">${st.height}m</span>
                        <span class="block text-[10px] text-slate-500">/ 100m</span>
                    </div>
                </div>
            `).join('');
        }

        /* ==========================================================================
           6. STUDENT JOIN & SOLO DEMO INITIALIZATION
           ========================================================================== */
        function joinStudentRoom() {
            SoundFX.init();
            const nameInput = document.getElementById('inputStudentName').value.trim();
            const codeInput = document.getElementById('inputRoomCode').value.trim().toUpperCase();

            if (!nameInput) {
                showToast('Masukkan nama panggilanmu terlebih dahulu!', 'warning');
                return;
            }
            if (codeInput.length !== 6) {
                showToast('Kode ruangan harus 6 karakter!', 'warning');
                return;
            }

            const room = getRoomData(codeInput);
            if (!room) {
                showToast(`Ruangan "${codeInput}" tidak ditemukan! Pastikan Guru sudah membuatnya di browser ini atau klik "Main Uji Coba Sekarang".`, 'error');
                return;
            }

            currentRole = 'student';
            currentRoomCode = codeInput;
            currentStudentName = nameInput;
            currentStudentId = 'STU_' + Math.random().toString(36).substring(2, 9);

            room.students[currentStudentId] = {
                id: currentStudentId,
                name: currentStudentName,
                height: 0,
                points: 0,
                finished: false
            };
            saveRoomData(currentRoomCode, room);

            enterStudentGameView();
        }

        function startQuickSoloDemo() {
            SoundFX.init();
            const code = 'SOLO' + Math.floor(10 + Math.random() * 89);
            const nameInput = document.getElementById('inputStudentName').value.trim() || 'Juara Kelas';

            currentRole = 'student';
            currentRoomCode = code;
            currentStudentName = nameInput;
            currentStudentId = 'SOLO_PLAYER';

            const demoRoom = {
                code: code,
                status: 'playing',
                durationSec: 180,
                endTime: Date.now() + 180 * 1000,
                questions: JSON.parse(JSON.stringify(DEFAULT_QUESTIONS)),
                students: {
                    [currentStudentId]: {
                        id: currentStudentId,
                        name: currentStudentName,
                        height: 0,
                        points: 0,
                        finished: false
                    },
                    'BOT_1': { id: 'BOT_1', name: 'Rina (Bot)', height: 28, points: 2, finished: false },
                    'BOT_2': { id: 'BOT_2', name: 'Dimas (Bot)', height: 15, points: 1, finished: false }
                }
            };
            saveRoomData(code, demoRoom);
            enterStudentGameView();
            showToast('Mode Uji Coba Solo dimulai! Jawab soal untuk mendapat Poin Lompat!', 'success');
        }

        function enterStudentGameView() {
            switchView('viewStudent');
            document.getElementById('hudRoomCode').textContent = currentRoomCode;
            document.getElementById('waitingRoomCode').textContent = currentRoomCode;
            document.getElementById('waitingStudentName').textContent = currentStudentName;

            initTowerGame();
            syncStudentWithRoom();

            if (syncInterval) clearInterval(syncInterval);
            syncInterval = setInterval(syncStudentWithRoom, 500);
        }

        function syncStudentWithRoom() {
            const room = getRoomData(currentRoomCode);
            if (!room) return;

            const waitOverlay = document.getElementById('studentWaitingOverlay');
            if (room.status === 'waiting') {
                waitOverlay.classList.remove('hidden');
                GameState.paused = true;
            } else {
                waitOverlay.classList.add('hidden');
                if (!document.getElementById('quizModal').classList.contains('hidden') ||
                    !document.getElementById('endGameModal').classList.contains('hidden')) {
                    GameState.paused = true;
                } else {
                    GameState.paused = false;
                }
            }

            // Timer Update
            if (room.status === 'playing' && room.endTime) {
                const rem = Math.max(0, Math.ceil((room.endTime - Date.now()) / 1000));
                document.getElementById('hudTimer').textContent = formatSeconds(rem);
                if (rem <= 15) {
                    document.getElementById('hudTimer').classList.add('text-rose-400', 'animate-pulse');
                } else {
                    document.getElementById('hudTimer').classList.remove('text-rose-400', 'animate-pulse');
                }

                if (rem === 0 && !GameState.gameEnded) {
                    room.status = 'ended';
                    saveRoomData(currentRoomCode, room);
                    triggerEndGameModal(false);
                }
            } else if (room.status === 'ended' && !GameState.gameEnded) {
                triggerEndGameModal(false);
            }

            // Simulate subtle bot movement in solo demo mode
            if (room.code.startsWith('SOLO') && room.status === 'playing') {
                ['BOT_1', 'BOT_2'].forEach(botId => {
                    if (room.students[botId] && !room.students[botId].finished && Math.random() < 0.25) {
                        room.students[botId].height = Math.min(98, room.students[botId].height + Math.floor(Math.random() * 3));
                    }
                });
            }

            // Push local student progress to room
            if (room.students[currentStudentId]) {
                room.students[currentStudentId].height = GameState.maxHeightMeters;
                room.students[currentStudentId].points = GameState.jumpPoints;
                room.students[currentStudentId].finished = GameState.reachedSummit;
                saveRoomData(currentRoomCode, room);
            }

            // Compute Rank
            const sorted = Object.values(room.students).sort((a, b) => b.height - a.height);
            const myRank = sorted.findIndex(s => s.id === currentStudentId) + 1;
            document.getElementById('hudRankText').textContent = `Peringkat #${myRank || 1} dari ${sorted.length}`;
        }

        /* ==========================================================================
           7. QUIZ MODAL & MEME FEEDBACK LOGIC
           ========================================================================== */
        let currentQuestionObj = null;
        let lastQuestionIdx = -1;

        function openQuizModal() {
            const room = getRoomData(currentRoomCode);
            if (!room || !room.questions || room.questions.length === 0) {
                showToast('Bank soal kosong!', 'error');
                return;
            }
            if (room.status === 'waiting') {
                showToast('Tunggu guru memulai permainan dulu ya!', 'warning');
                return;
            }

            GameState.paused = true;
            document.getElementById('quizModal').classList.remove('hidden');
            loadRandomQuestionIntoModal();
        }

        function closeQuizModal() {
            document.getElementById('quizModal').classList.add('hidden');
            const room = getRoomData(currentRoomCode);
            if (room && room.status === 'playing' && !GameState.gameEnded) {
                GameState.paused = false;
            }
        }

        function nextQuestionInModal() {
            loadRandomQuestionIntoModal();
        }

        function loadRandomQuestionIntoModal() {
            const room = getRoomData(currentRoomCode);
            if (!room || room.questions.length === 0) return;

            document.getElementById('quizMemeFeedback').classList.add('hidden');
            document.getElementById('quizQuestionContainer').classList.remove('hidden');

            let idx = Math.floor(Math.random() * room.questions.length);
            if (room.questions.length > 1 && idx === lastQuestionIdx) {
                idx = (idx + 1) % room.questions.length;
            }
            lastQuestionIdx = idx;
            currentQuestionObj = room.questions[idx];

            document.getElementById('modalQuestionText').textContent = currentQuestionObj.q;
            for (let i = 0; i < 4; i++) {
                document.getElementById(`quizOptText${i}`).textContent = currentQuestionObj.options[i];
            }
        }

        function submitQuizAnswer(selectedIdx) {
            if (!currentQuestionObj) return;
            const isCorrect = (selectedIdx === currentQuestionObj.correct);

            document.getElementById('quizQuestionContainer').classList.add('hidden');
            const feedbackEl = document.getElementById('quizMemeFeedback');
            feedbackEl.classList.remove('hidden');

            const visualEl = document.getElementById('memeCardVisual');
            const badgeEl = document.getElementById('memeBadge');
            const headEl = document.getElementById('memeHeadline');
            const subEl = document.getElementById('memeSubtext');

            if (isCorrect) {
                SoundFX.correct();
                GameState.jumpPoints += 2;
                updatePointsHUD();

                const meme = MEMES_CORRECT[Math.floor(Math.random() * MEMES_CORRECT.length)];
                visualEl.className = `mx-auto w-40 h-40 rounded-3xl bg-gradient-to-br ${meme.bg} flex items-center justify-center mb-4 border-4 shadow-2xl`;
                visualEl.innerHTML = meme.svg;
                badgeEl.className = 'inline-block px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40';
                badgeEl.textContent = meme.badge;
                headEl.textContent = meme.headline;
                headEl.className = 'font-display text-2xl sm:text-3xl font-bold text-emerald-300 mb-1';
                subEl.textContent = meme.subtext;
            } else {
                SoundFX.wrong();
                const meme = MEMES_WRONG[Math.floor(Math.random() * MEMES_WRONG.length)];
                visualEl.className = `mx-auto w-40 h-40 rounded-3xl bg-gradient-to-br ${meme.bg} flex items-center justify-center mb-4 border-4 shadow-2xl`;
                visualEl.innerHTML = meme.svg;
                badgeEl.className = 'inline-block px-4 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 bg-rose-500/20 text-rose-300 border border-rose-400/40';
                badgeEl.textContent = meme.badge;
                headEl.textContent = meme.headline;
                headEl.className = 'font-display text-2xl sm:text-3xl font-bold text-rose-300 mb-1';
                subEl.textContent = meme.subtext;
            }

            syncStudentWithRoom();
        }

        /* ==========================================================================
           8. TOWER OF HELL 2D HTML5 CANVAS PLATFORMER ENGINE
           ========================================================================== */
        let canvas, ctx;
        let animFrameId = null;

        const TOWER_CONFIG = {
            virtualWidth: 800,
            totalPlatforms: 25, // 25 tingkat menara -> 100 meter
            platformSpacingY: 115,
            gravity: 0.58,
            moveSpeed: 5.4,
            jumpVelocity: -14.8
        };

        const GameState = {
            paused: false,
            gameEnded: false,
            jumpPoints: 0,
            maxHeightMeters: 0,
            reachedSummit: false,
            cameraY: 0,
            lavaY: 140,
            platforms: [],
            particles: [],
            player: {
                x: 380,
                y: 0,
                w: 34,
                h: 42,
                vx: 0,
                vy: 0,
                onGround: false,
                facing: 1,
                color: '#38bdf8'
            },
            checkpoint: {
                x: 380,
                y: 0,
                index: 0
            },
            keys: {
                left: false,
                right: false
            }
        };

        function initTowerGame() {
            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');

            GameState.paused = false;
            GameState.gameEnded = false;
            GameState.jumpPoints = 0;
            GameState.maxHeightMeters = 0;
            GameState.reachedSummit = false;
            GameState.particles = [];

            buildTowerPlatforms();

            // Place player on Base Platform (index 0)
            const base = GameState.platforms[0];
            GameState.player.x = base.x + base.w / 2 - GameState.player.w / 2;
            GameState.player.y = base.y - GameState.player.h;
            GameState.player.vx = 0;
            GameState.player.vy = 0;
            GameState.player.onGround = true;

            GameState.checkpoint = {
                x: GameState.player.x,
                y: GameState.player.y,
                index: 0
            };

            GameState.cameraY = GameState.player.y - 450;
            GameState.lavaY = base.y + 130;

            updatePointsHUD();
            updateHeightHUD();
            document.getElementById('btnRespawn').classList.remove('respawn-urgent');

            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            if (animFrameId) cancelAnimationFrame(animFrameId);
            gameLoop();
        }

        function stopGameLoop() {
            if (animFrameId) cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        function resizeCanvas() {
            if (!canvas) return;
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }

        function buildTowerPlatforms() {
            const plats = [];
            const neonPalette = [
                { fill: '#ec4899', glow: '#f472b6' }, // Pink Neon
                { fill: '#06b6d4', glow: '#22d3ee' }, // Cyan Neon
                { fill: '#a855f7', glow: '#c084fc' }, // Purple Neon
                { fill: '#f59e0b', glow: '#fbbf24' }, // Amber Neon
                { fill: '#10b981', glow: '#34d399' }  // Emerald Checkpoint
            ];

            // Platform 0: Wide Starting Floor
            plats.push({
                index: 0,
                x: 120,
                y: 0,
                w: 560,
                h: 26,
                type: 'start',
                color: '#6366f1',
                glow: '#818cf8',
                vx: 0
            });

            let prevX = 330;
            for (let i = 1; i <= TOWER_CONFIG.totalPlatforms; i++) {
                const y = -i * TOWER_CONFIG.platformSpacingY;
                const isSummit = (i === TOWER_CONFIG.totalPlatforms);
                const isCheckpoint = (!isSummit && i % 5 === 0);

                let w = isSummit ? 480 : (isCheckpoint ? 240 : Math.max(125, 195 - i * 2));
                // Ensure reachable horizontal gap from previous platform
                const maxShift = 210;
                let minX = Math.max(70, prevX - maxShift);
                let maxX = Math.min(TOWER_CONFIG.virtualWidth - 70 - w, prevX + maxShift);
                let x = isSummit ? (TOWER_CONFIG.virtualWidth - w) / 2 : (minX + Math.random() * Math.max(10, maxX - minX));
                prevX = x;

                const theme = isSummit
                    ? { fill: '#facc15', glow: '#fef08a' }
                    : isCheckpoint
                        ? neonPalette[4]
                        : neonPalette[i % 4];

                // Add gentle moving platforms at higher levels (non-checkpoint)
                let vx = 0;
                if (!isSummit && !isCheckpoint && i >= 7 && i % 3 === 0) {
                    vx = (i % 2 === 0 ? 1 : -1) * (1.2 + Math.min(1.5, i * 0.05));
                }

                plats.push({
                    index: i,
                    x,
                    y,
                    w,
                    h: isSummit ? 30 : 20,
                    type: isSummit ? 'summit' : (isCheckpoint ? 'checkpoint' : 'normal'),
                    color: theme.fill,
                    glow: theme.glow,
                    vx,
                    checkpointReached: false
                });
            }
            GameState.platforms = plats;
        }

        function attemptPlayerJump() {
            if (GameState.paused || GameState.gameEnded) return;
            const p = GameState.player;

            // Only allow jump when standing on a platform
            if (!p.onGround) return;

            if (GameState.jumpPoints <= 0) {
                SoundFX.noPoints();
                showToast('Poin lompat habis (0)! Jawab soal dulu untuk dapat +2 Poin!', 'warning');
                openQuizModal();
                return;
            }

            // Consume 1 Jump Point!
            GameState.jumpPoints -= 1;
            updatePointsHUD();

            p.vy = TOWER_CONFIG.jumpVelocity;
            p.onGround = false;
            SoundFX.jump();
            spawnParticles(p.x + p.w / 2, p.y + p.h, '#38bdf8', 12);
            syncStudentWithRoom();
        }

        function triggerRespawn() {
            SoundFX.respawn();
            const p = GameState.player;
            p.x = GameState.checkpoint.x;
            p.y = GameState.checkpoint.y - 4;
            p.vx = 0;
            p.vy = 0;
            p.onGround = false;

            document.getElementById('btnRespawn').classList.remove('respawn-urgent');
            spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#f43f5e', 18);
            showToast(`Respawn ke Checkpoint #${GameState.checkpoint.index / 5} berhasil! Poin lompatmu tetap aman.`, 'info');
        }

        function spawnParticles(x, y, color, count = 10) {
            for (let i = 0; i < count; i++) {
                GameState.particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.8) * 6,
                    life: 1,
                    color,
                    size: 3 + Math.random() * 4
                });
            }
        }

        function updatePointsHUD() {
            const el = document.getElementById('hudJumpPoints');
            el.textContent = GameState.jumpPoints;
            const box = document.getElementById('hudPointsBox');
            if (GameState.jumpPoints === 0) {
                box.classList.add('border-rose-400');
                box.classList.remove('border-amber-400/60');
            } else {
                box.classList.remove('border-rose-400');
                box.classList.add('border-amber-400/60');
            }
        }

        function updateHeightHUD() {
            const summitY = Math.abs(GameState.platforms[GameState.platforms.length - 1].y);
            const currentY = Math.max(0, -GameState.player.y);
            const meters = Math.min(100, Math.round((currentY / summitY) * 100));
            if (meters > GameState.maxHeightMeters) {
                GameState.maxHeightMeters = meters;
            }
            document.getElementById('hudHeightText').textContent = `${meters}m`;
            document.getElementById('hudProgressBar').style.width = `${meters}%`;
        }

        function updatePhysics() {
            if (GameState.paused || GameState.gameEnded) return;

            const p = GameState.player;

            // Update Moving Platforms
            GameState.platforms.forEach(plat => {
                if (plat.vx !== 0) {
                    plat.x += plat.vx;
                    if (plat.x < 65 || plat.x + plat.w > TOWER_CONFIG.virtualWidth - 65) {
                        plat.vx *= -1;
                    }
                }
            });

            // Horizontal Movement (Free!)
            if (GameState.keys.left) {
                p.vx = -TOWER_CONFIG.moveSpeed;
                p.facing = -1;
            } else if (GameState.keys.right) {
                p.vx = TOWER_CONFIG.moveSpeed;
                p.facing = 1;
            } else {
                p.vx *= 0.78;
                if (Math.abs(p.vx) < 0.1) p.vx = 0;
            }

            const prevY = p.y;
            p.x += p.vx;
            p.vy += TOWER_CONFIG.gravity;
            p.y += p.vy;

            // Tower Walls Bounds
            if (p.x < 55) p.x = 55;
            if (p.x + p.w > TOWER_CONFIG.virtualWidth - 55) p.x = TOWER_CONFIG.virtualWidth - 55 - p.w;

            // One-way Platform Landing Collision (When falling downwards)
            p.onGround = false;
            if (p.vy >= 0) {
                for (let plat of GameState.platforms) {
                    const prevBottom = prevY + p.h;
                    const currBottom = p.y + p.h;
                    const withinX = (p.x + p.w - 6 > plat.x) && (p.x + 6 < plat.x + plat.w);

                    if (withinX && prevBottom <= plat.y + 10 && currBottom >= plat.y) {
                        p.y = plat.y - p.h;
                        p.vy = 0;
                        p.onGround = true;
                        p.x += plat.vx; // Carry player on moving platform

                        // Check if Checkpoint
                        if (plat.type === 'checkpoint' && !plat.checkpointReached) {
                            plat.checkpointReached = true;
                            GameState.checkpoint = {
                                x: plat.x + plat.w / 2 - p.w / 2,
                                y: plat.y - p.h,
                                index: plat.index
                            };
                            SoundFX.checkpoint();
                            spawnParticles(p.x + p.w / 2, p.y + p.h, '#34d399', 22);
                            const banner = document.getElementById('checkpointBanner');
                            banner.classList.remove('hidden');
                            setTimeout(() => banner.classList.add('hidden'), 2200);
                        }

                        // Check if Summit Reached!
                        if (plat.type === 'summit' && !GameState.reachedSummit) {
                            GameState.reachedSummit = true;
                            GameState.maxHeightMeters = 100;
                            syncStudentWithRoom();
                            triggerEndGameModal(true);
                        }
                        break;
                    }
                }
            }

            // Highlight Respawn button if player falls significantly below their checkpoint
            if (p.y > GameState.checkpoint.y + 180) {
                document.getElementById('btnRespawn').classList.add('respawn-urgent');
            }

            // Auto-Respawn if fallen into the Void / Lava Pit at the bottom
            if (p.y > GameState.lavaY) {
                showToast('Ups, terjatuh ke zona lava! Otomatis Respawn ke Checkpoint terakhir.', 'warning');
                triggerRespawn();
            }

            // Smooth Camera Follow
            const targetCamY = p.y - 360;
            GameState.cameraY += (targetCamY - GameState.cameraY) * 0.1;

            // Update Particles
            for (let i = GameState.particles.length - 1; i >= 0; i--) {
                const pt = GameState.particles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.life -= 0.035;
                if (pt.life <= 0) GameState.particles.splice(i, 1);
            }

            updateHeightHUD();
        }

        function drawTowerScene() {
            if (!ctx) return;
            const W = canvas.width;
            const H = canvas.height;

            // Clear Background with Deep Tower Gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
            bgGrad.addColorStop(0, '#090d16');
            bgGrad.addColorStop(0.5, '#1e1b4b');
            bgGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            // Calculate scale so virtualWidth (800) fits nicely on any screen
            const scale = Math.min(W / TOWER_CONFIG.virtualWidth, 1.15);
            const offsetX = (W - TOWER_CONFIG.virtualWidth * scale) / 2;

            ctx.save();
            ctx.translate(offsetX, -GameState.cameraY * scale + (H * 0.18));
            ctx.scale(scale, scale);

            // Draw Tower Interior Walls & Grid Lines
            const topY = -TOWER_CONFIG.totalPlatforms * TOWER_CONFIG.platformSpacingY - 250;
            const botY = 250;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
            ctx.fillRect(50, topY, TOWER_CONFIG.virtualWidth - 100, botY - topY);

            // Neon Tower Pillars (Left & Right Borders)
            ctx.fillStyle = '#312e81';
            ctx.fillRect(42, topY, 12, botY - topY);
            ctx.fillRect(TOWER_CONFIG.virtualWidth - 54, topY, 12, botY - topY);

            // Height Markers every 5 levels
            ctx.font = 'bold 14px Fredoka, sans-serif';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
            for (let i = 0; i <= TOWER_CONFIG.totalPlatforms; i += 5) {
                const y = -i * TOWER_CONFIG.platformSpacingY;
                const m = Math.round((i / TOWER_CONFIG.totalPlatforms) * 100);
                ctx.fillText(`${m}m`, 68, y - 6);
                ctx.fillRect(65, y, TOWER_CONFIG.virtualWidth - 130, 1);
            }

            // Draw Platforms
            GameState.platforms.forEach(plat => {
                ctx.save();
                ctx.shadowColor = plat.glow;
                ctx.shadowBlur = 14;
                ctx.fillStyle = plat.color;

                // Rounded Platform Rect
                roundRect(ctx, plat.x, plat.y, plat.w, plat.h, 8);
                ctx.fill();

                // Top Highlight Strip
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                roundRect(ctx, plat.x + 4, plat.y + 2, plat.w - 8, 5, 3);
                ctx.fill();

                // Checkpoint Flag Visual
                if (plat.type === 'checkpoint') {
                    const flagX = plat.x + plat.w / 2;
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(flagX - 2, plat.y - 38, 4, 38);
                    ctx.fillStyle = plat.checkpointReached ? '#10b981' : '#f43f5e';
                    ctx.beginPath();
                    ctx.moveTo(flagX + 2, plat.y - 38);
                    ctx.lineTo(flagX + 26, plat.y - 29);
                    ctx.lineTo(flagX + 2, plat.y - 20);
                    ctx.closePath();
                    ctx.fill();

                    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
                    ctx.fillStyle = '#ecfdf5';
                    ctx.textAlign = 'center';
                    ctx.fillText(`CHECKPOINT ${plat.index / 5}`, flagX, plat.y + 14);
                }

                // Summit Crown / Trophy Visual
                if (plat.type === 'summit') {
                    ctx.font = '36px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('🏆', plat.x + plat.w / 2, plat.y - 16);
                    ctx.font = 'bold 14px Fredoka, sans-serif';
                    ctx.fillStyle = '#0f172a';
                    ctx.fillText('GARIS FINIS • PUNCAK MENARA', plat.x + plat.w / 2, plat.y + 20);
                }
                ctx.restore();
            });

            // Draw Lava / Void Pit at Bottom
            const lavaGrad = ctx.createLinearGradient(0, GameState.lavaY, 0, GameState.lavaY + 120);
            lavaGrad.addColorStop(0, 'rgba(244, 63, 94, 0.85)');
            lavaGrad.addColorStop(1, 'rgba(136, 19, 55, 0.95)');
            ctx.fillStyle = lavaGrad;
            ctx.fillRect(50, GameState.lavaY, TOWER_CONFIG.virtualWidth - 100, 160);

            // Draw Particles
            GameState.particles.forEach(pt => {
                ctx.globalAlpha = Math.max(0, pt.life);
                ctx.fillStyle = pt.color;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Draw Player Character (Roblox-inspired Cute Blocky Avatar)
            const p = GameState.player;
            ctx.save();
            // Body
            ctx.fillStyle = '#38bdf8';
            roundRect(ctx, p.x + 3, p.y + 16, p.w - 6, p.h - 16, 6);
            ctx.fill();
            // Head
            ctx.fillStyle = '#fde047';
            roundRect(ctx, p.x + 4, p.y, p.w - 8, 18, 6);
            ctx.fill();
            // Eyes
            ctx.fillStyle = '#0f172a';
            const eyeOffset = p.facing === 1 ? 6 : -2;
            ctx.fillRect(p.x + 11 + eyeOffset, p.y + 6, 3.5, 4.5);
            ctx.fillRect(p.x + 18 + eyeOffset, p.y + 6, 3.5, 4.5);

            // Player Name Tag above Avatar
            ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(currentStudentName, p.x + p.w / 2, p.y - 8);
            ctx.restore();

            ctx.restore();
        }

        function roundRect(ctx, x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        }

        function gameLoop() {
            updatePhysics();
            drawTowerScene();
            animFrameId = requestAnimationFrame(gameLoop);
        }

        /* ==========================================================================
           9. END GAME / VICTORY MODAL
           ========================================================================== */
        function triggerEndGameModal(isVictory) {
            GameState.gameEnded = true;
            GameState.paused = true;
            document.getElementById('quizModal').classList.add('hidden');
            const modal = document.getElementById('endGameModal');
            modal.classList.remove('hidden');

            if (isVictory) {
                SoundFX.victory();
                document.getElementById('endGameTrophy').textContent = '🏆';
                document.getElementById('endGameTitle').textContent = 'PUNCAK TERCAPAI!';
                document.getElementById('endGameSubtitle').textContent = `Selamat ${currentStudentName}! Kamu berhasil menaklukkan Tower of Quiz setinggi 100m!`;
            } else {
                SoundFX.checkpoint();
                document.getElementById('endGameTrophy').textContent = '⏰';
                document.getElementById('endGameTitle').textContent = 'WAKTU HABIS!';
                document.getElementById('endGameSubtitle').textContent = `Permainan selesai! Ketinggian tertinggimu adalah ${GameState.maxHeightMeters}m.`;
            }

            const room = getRoomData(currentRoomCode);
            const listEl = document.getElementById('endGameLeaderboard');
            if (room && room.students) {
                const sorted = Object.values(room.students).sort((a, b) => b.height - a.height);
                listEl.innerHTML = sorted.map((st, idx) => `
                    <div class="flex items-center justify-between px-3 py-2 rounded-xl ${st.id === currentStudentId ? 'bg-indigo-500/20 border border-indigo-400/50' : 'bg-slate-900'}">
                        <div class="flex items-center gap-2">
                            <span class="font-display font-bold text-amber-300 w-5">#${idx + 1}</span>
                            <span class="font-bold text-sm text-white">${escapeHtml(st.name)}</span>
                        </div>
                        <span class="font-display font-bold text-emerald-400 text-sm">${st.height}m</span>
                    </div>
                `).join('');
            }
        }

        function replayOrContinue() {
            document.getElementById('endGameModal').classList.add('hidden');
            if (currentRoomCode && currentRoomCode.startsWith('SOLO')) {
                startQuickSoloDemo();
            } else {
                initTowerGame();
            }
        }

        /* ==========================================================================
           10. KEYBOARD & TOUCH EVENT LISTENERS
           ========================================================================== */
        window.addEventListener('keydown', (e) => {
            if (currentRole !== 'student') return;
            const quizOpen = !document.getElementById('quizModal').classList.contains('hidden');

            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                GameState.keys.left = true;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                GameState.keys.right = true;
            }
            if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !quizOpen) {
                e.preventDefault();
                attemptPlayerJump();
            }
            if (e.code === 'KeyR' && !quizOpen) {
                triggerRespawn();
            }
            if ((e.code === 'KeyQ' || e.code === 'Enter') && !quizOpen) {
                openQuizModal();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                GameState.keys.left = false;
            }
            if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                GameState.keys.right = false;
            }
        });

        // Mobile Touch Controls Binding
        function bindTouchHold(btnId, keyName) {
            const btn = document.getElementById(btnId);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); GameState.keys[keyName] = true; }, { passive: false });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); GameState.keys[keyName] = false; }, { passive: false });
            btn.addEventListener('mousedown', () => { GameState.keys[keyName] = true; });
            btn.addEventListener('mouseup', () => { GameState.keys[keyName] = false; });
            btn.addEventListener('mouseleave', () => { GameState.keys[keyName] = false; });
        }

        window.addEventListener('DOMContentLoaded', () => {
            bindTouchHold('touchLeft', 'left');
            bindTouchHold('touchRight', 'right');
            const jumpBtn = document.getElementById('touchJump');
            if (jumpBtn) {
                jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); attemptPlayerJump(); }, { passive: false });
                jumpBtn.addEventListener('click', () => attemptPlayerJump());
            }
        });

        /* ==========================================================================
           11. UTILITIES
           ========================================================================== */
        function formatSeconds(totalSec) {
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    </script>
</body>
</html>
