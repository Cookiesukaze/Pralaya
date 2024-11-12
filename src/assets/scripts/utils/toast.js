import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

class ToastManager {
    constructor() {
        this.currentToast = null

        // 定义位置常量
        this.POSITIONS = {
            TOP_LEFT: { gravity: "top", position: "left" },
            TOP_CENTER: { gravity: "top", position: "center" },
            TOP_RIGHT: { gravity: "top", position: "right" },
            BOTTOM_LEFT: { gravity: "bottom", position: "left" },
            BOTTOM_CENTER: { gravity: "bottom", position: "center" },
            BOTTOM_RIGHT: { gravity: "bottom", position: "right" }
        }

        this.defaultConfig = {
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            offset: {
                x: 20,  // 水平偏移
                y: 20   // 垂直偏移
            }
        }
    }

    // 设置默认位置
    setDefaultPosition(gravity, position) {
        this.defaultConfig.gravity = gravity
        this.defaultConfig.position = position
    }

    // 设置偏移量
    setOffset(x, y) {
        this.defaultConfig.offset = { x, y }
    }

    loading(message = "加载中...", position = null) {
        this.hideCurrentToast()
        this.currentToast = Toastify({
            ...this.defaultConfig,
            ...(position && this.POSITIONS[position]),
            text: message,
            duration: -1,
            style: {
                background: "#3498db"
            }
        }).showToast()
        return this.currentToast
    }

    success(message, duration = 3000, position = null) {
        this.hideCurrentToast()
        this.currentToast = Toastify({
            ...this.defaultConfig,
            ...(position && this.POSITIONS[position]),
            text: message,
            duration: duration,
            style: {
                background: "#07bc0c"
            }
        }).showToast()
        return this.currentToast
    }

    error(message, duration = 3000, position = null) {
        this.hideCurrentToast()
        this.currentToast = Toastify({
            ...this.defaultConfig,
            ...(position && this.POSITIONS[position]),
            text: message,
            duration: duration,
            style: {
                background: "#e74c3c"
            }
        }).showToast()
        return this.currentToast
    }

    // 完全自定义的显示方法
    show(config) {
        this.hideCurrentToast()
        this.currentToast = Toastify({
            ...this.defaultConfig,
            ...config
        }).showToast()
        return this.currentToast
    }

    hideCurrentToast() {
        if (this.currentToast) {
            this.currentToast.hideToast()
            this.currentToast = null
        }
    }
}

export const toast = new ToastManager()
