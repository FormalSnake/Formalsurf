export {}

declare global {
  interface WebviewAttributes {
    src?: string
    nodeintegration?: boolean
    nodeintegrationinsubframes?: boolean
    plugins?: boolean
    preload?: string
    httpreferrer?: string
    useragent?: string
    disablewebsecurity?: boolean
    partition?: string
    allowpopups?: boolean
    webpreferences?: string
    enableblinkfeatures?: string
    disableblinkfeatures?: string
  }

  interface WebviewMethods {
    loadURL(
      url: string,
      options?: {
        httpReferrer?: string
        userAgent?: string
        extraHeaders?: string
        postData?: any[]
        baseURLForDataURL?: string
      }
    ): Promise<void>
    downloadURL(url: string, options?: { headers?: Record<string, string> }): void
    getURL(): string
    getTitle(): string
    isLoading(): boolean
    isLoadingMainFrame(): boolean
    isWaitingForResponse(): boolean
    stop(): void
    reload(): void
    reloadIgnoringCache(): void
    canGoBack(): boolean
    canGoForward(): boolean
    canGoToOffset(offset: number): boolean
    clearHistory(): void
    goBack(): void
    goForward(): void
    goToIndex(index: number): void
    goToOffset(offset: number): void
    isCrashed(): boolean
    setUserAgent(userAgent: string): void
    getUserAgent(): string
    insertCSS(css: string): Promise<string>
    removeInsertedCSS(key: string): Promise<void>
    executeJavaScript(code: string, userGesture?: boolean): Promise<any>
    openDevTools(): void
    closeDevTools(): void
    isDevToolsOpened(): boolean
    isDevToolsFocused(): boolean
    inspectElement(x: number, y: number): void
    inspectSharedWorker(): void
    inspectServiceWorker(): void
    setAudioMuted(muted: boolean): void
    isAudioMuted(): boolean
    isCurrentlyAudible(): boolean
    undo(): void
    redo(): void
    cut(): void
    copy(): void
    paste(): void
    pasteAndMatchStyle(): void
    delete(): void
    selectAll(): void
    unselect(): void
    scrollToTop(): void
    scrollToBottom(): void
    adjustSelection(options: { start?: number; end?: number }): void
    replace(text: string): void
    replaceMisspelling(text: string): void
    insertText(text: string): Promise<void>
    findInPage(
      text: string,
      options?: { forward?: boolean; findNext?: boolean; matchCase?: boolean }
    ): number
    stopFindInPage(action: 'clearSelection' | 'keepSelection' | 'activateSelection'): void
    print(options?: {
      silent?: boolean
      printBackground?: boolean
      deviceName?: string
      color?: boolean
      margins?: {
        marginType?: string
        top?: number
        bottom?: number
        left?: number
        right?: number
      }
      landscape?: boolean
      scaleFactor?: number
      pagesPerSheet?: number
      collate?: boolean
      copies?: number
      pageRanges?: { from: number; to: number }[]
      duplexMode?: string
      dpi?: { horizontal?: number; vertical?: number }
      header?: string
      footer?: string
      pageSize?: string | { height: number; width: number }
    }): Promise<void>
    printToPDF(options: {
      landscape?: boolean
      displayHeaderFooter?: boolean
      printBackground?: boolean
      scale?: number
      pageSize?: string | { height: number; width: number }
      margins?: { top?: number; bottom?: number; left?: number; right?: number }
      pageRanges?: string
      headerTemplate?: string
      footerTemplate?: string
      preferCSSPageSize?: boolean
      generateTaggedPDF?: boolean
      generateDocumentOutline?: boolean
    }): Promise<Uint8Array>
    capturePage(rect?: { x: number; y: number; width: number; height: number }): Promise<any>
    send(channel: string, ...args: any[]): Promise<void>
    sendToFrame(frameId: [number, number], channel: string, ...args: any[]): Promise<void>
    sendInputEvent(event: any): Promise<void>
    setZoomFactor(factor: number): void
    setZoomLevel(level: number): void
    getZoomFactor(): number
    getZoomLevel(): number
    setVisualZoomLevelLimits(minimumLevel: number, maximumLevel: number): Promise<void>
    showDefinitionForSelection(): void
    getWebContentsId(): number
  }

  interface WebviewElement extends HTMLElement, WebviewAttributes, WebviewMethods {
    hasListeners?: boolean
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions
    ): void
  }

  interface HTMLElementTagNameMap {
    webview: WebviewElement
  }
}
