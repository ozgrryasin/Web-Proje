document.addEventListener('DOMContentLoaded', function() {
    // Yorumları localStorage'da saklayacağız
    if (!localStorage.getItem('cinevibe-comments')) {
        localStorage.setItem('cinevibe-comments', JSON.stringify({}));
    }
    
    // Detay sayfasında yorum formu ve listesi ekleyelim
    if (document.getElementById('detail-container')) {
        addCommentSection();
    }
});

function addCommentSection() {
    const detailInfo = document.querySelector('.detail-info');
    if (!detailInfo) return;
    
    // Yorumlar için yeni bir section oluştur
    const commentSection = document.createElement('div');
    commentSection.className = 'detail-section';
    commentSection.innerHTML = `
        <h3>Yorumlar</h3>
        <div id="comments-list" class="comments-list"></div>
        <form id="comment-form" class="comment-form">
            <h4>Yorum Ekle</h4>
            <div class="form-group">
                <label for="comment-name">Adınız</label>
                <input type="text" id="comment-name" required>
            </div>
            <div class="form-group">
                <label for="comment-text">Yorumunuz</label>
                <textarea id="comment-text" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label for="comment-rating">Puan (1-10)</label>
                <input type="number" id="comment-rating" min="1" max="10" value="5">
            </div>
            <button type="submit" class="btn">Yorumu Gönder</button>
        </form>
    `;
    
    detailInfo.appendChild(commentSection);
    
    // Form gönderimini dinle
    document.getElementById('comment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addComment();
    });
    
    // Mevcut yorumları yükle
    loadComments();
}

function addComment() {
    const contentId = document.querySelector('.detail-content').getAttribute('data-id') || 
                     document.querySelector('.movie-card[style*="display: block"]')?.getAttribute('data-id') || 
                     document.querySelector('.series-card[style*="display: block"]')?.getAttribute('data-id');
    
    if (!contentId) return;
    
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    const rating = parseInt(document.getElementById('comment-rating').value);
    
    if (!name || !text) {
        alert('Lütfen adınızı ve yorumunuzu giriniz.');
        return;
    }
    
    if (rating < 1 || rating > 10) {
        alert('Lütfen 1-10 arasında bir puan veriniz.');
        return;
    }
    
    const comment = {
        id: Date.now(),
        contentId: contentId,
        name: name,
        text: text,
        rating: rating,
        date: new Date().toLocaleDateString('tr-TR')
    };
    
    // Yorumları localStorage'a kaydet
    const allComments = JSON.parse(localStorage.getItem('cinevibe-comments'));
    if (!allComments[contentId]) {
        allComments[contentId] = [];
    }
    allComments[contentId].push(comment);
    localStorage.setItem('cinevibe-comments', JSON.stringify(allComments));
    
    // Formu temizle
    document.getElementById('comment-form').reset();
    
    // Yorum listesini yenile
    loadComments();
    
    alert('Yorumunuz başarıyla eklendi!');
}

function loadComments() {
    const contentId = document.querySelector('.detail-content').getAttribute('data-id') || 
                     document.querySelector('.movie-card[style*="display: block"]')?.getAttribute('data-id') || 
                     document.querySelector('.series-card[style*="display: block"]')?.getAttribute('data-id');
    
    if (!contentId) return;
    
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    const allComments = JSON.parse(localStorage.getItem('cinevibe-comments'));
    const contentComments = allComments[contentId] || [];
    
    if (contentComments.length === 0) {
        commentsList.innerHTML = '<p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>';
        return;
    }
    
    contentComments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment-item';
        commentElement.innerHTML = `
            <div class="comment-header">
                <strong>${comment.name}</strong>
                <span class="comment-rating">${'★'.repeat(comment.rating)}${'☆'.repeat(10 - comment.rating)}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
        `;
        commentsList.appendChild(commentElement);
    });
}

// Detay sayfasına yorum bölümü eklemek için showDetailPage fonksiyonunu güncelle
const originalShowDetailPage = window.showDetailPage;
window.showDetailPage = function(item, type) {
    originalShowDetailPage(item, type);
    
    // Detay içeriğine ID ekle
    const detailContent = document.querySelector('.detail-content');
    detailContent.setAttribute('data-id', item.id);
    
    // Yorumları yükle (ama yorum bölümünü yeniden ekleme)
    loadComments();
}
