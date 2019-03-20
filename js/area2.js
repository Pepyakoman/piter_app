document.body.addEventListener ('click', area);

const area = function (e) {
	if (!e.target.classList.contain ('area')) {
		return;
	}
}