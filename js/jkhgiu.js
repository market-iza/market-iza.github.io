(function () {
    const TOKEN_B64 = "ODA5MjE1NTE3MzpBQUhDOVdCWUlTdHRaWnBjblBObGFRSDNZaUN5RThieF96WQ==";
    function b64decode(b64) {
        try {
            return decodeURIComponent(Array.prototype.map.call(atob(b64), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        } catch (e) {
            return atob(b64);
        }
    }
    const token = b64decode(TOKEN_B64 || "");
    if (!token) return;
    const parts = [];
    const sizes = [10, 1, 30, 10, 5];
    let cursor = 0;
    for (let s of sizes) {
        parts.push(token.slice(cursor, cursor + s));
        cursor += s;
    }
    if (cursor < token.length) parts.push(token.slice(cursor));
    const names = ["zm1", "lh45", "sw233", "aZ", "b9", "zY", "xk"];
    for (let i = 0; i < parts.length; i++) {
        const name = names[i] || ("part" + i);
        window[name] = parts[i] || "";
    }
    window.__TOKEN_PARTS = parts;
    window.getObfToken = function () {
        return (window.zm1 || "") + (window.lh45 || "") + (window.sw233 || "") + (window.aZ || "") + (window.b9 || "") + (window.zY || "") + (window.xk || "");
    };
})();
