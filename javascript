function backToHomePortal() {
    if (syncInterval) clearInterval(syncInterval);
    stopGameLoop();
    currentRole = null;
    currentRoomCode = null;
    document.getElementById('endGameModal').classList.add('hidden');
    document.getElementById('quizModal').classList.add('hidden');
    
    // Mengarahkan kembali ke halaman utama index.html
    window.location.href = 'index.html';
}
