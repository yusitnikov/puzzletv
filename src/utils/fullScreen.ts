export const isFullScreen = () => {
    const target = window.document as any;

    return !!(
        target.fullscreenElement ||
        target.webkitFullscreenElement ||
        target.mozFullscreenElement ||
        target.msFullscreenElement
    );
};

export const toggleFullScreen = () => {
    if (isFullScreen()) {
        const target = window.document as any;
        (target.exitFullscreen || target.webkitExitFullscreen || target.msExitFullscreen).call(target);
    } else {
        const target = window.document.documentElement as any;
        (target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen).call(target);
    }
};
