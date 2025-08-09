// simple confirm for delete links if you prefer JS confirmation
document.addEventListener('click', function(e) {
    if (e.target.matches('a[data-confirm]')) {
        if (!confirm('Are you sure?')) e.preventDefault();
    }
});