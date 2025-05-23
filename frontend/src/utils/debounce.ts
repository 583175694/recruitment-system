/**
 * 创建一个防抖函数
 * @param fn 要防抖的函数
 * @param delay 防抖延迟时间，单位为毫秒
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number = 300): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    // 如果已经有定时器，则清除
    if (timer !== null) {
      clearTimeout(timer);
    }
    
    // 设置新的定时器
    timer = window.setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 对按钮点击事件进行防抖处理的Vue指令
 */
export const debounceClickDirective = {
  name: 'debounce-click',
  beforeMount(el: HTMLElement, binding: any) {
    const { value, arg } = binding;
    const delay = arg ? parseInt(arg) : 300;
    
    // 保存原始的点击处理函数
    const originalClickHandler = el.onclick;
    
    // 如果已经有点击处理函数，则进行包装
    if (typeof originalClickHandler === 'function') {
      el.onclick = debounce(originalClickHandler, delay);
    }
    
    // 如果传递了值（函数），也进行防抖处理
    if (typeof value === 'function') {
      el.onclick = debounce(value, delay);
    }
  }
}; 