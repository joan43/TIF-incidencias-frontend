/** Tipado mínimo de jQuery.ajax, usado por el cliente REST. */
export {};

declare global {
  interface JQueryXHR {
    status: number;
    responseText: string;
    responseJSON?: unknown;
  }

  interface JQueryAjaxSettings {
    url: string;
    method: string;
    dataType: "json";
    contentType?: string;
    headers: Record<string, string>;
    data?: string;
    success: (data: unknown) => void;
    error: (xhr: JQueryXHR) => void;
  }

  interface JQueryStatic {
    ajax: (settings: JQueryAjaxSettings) => unknown;
  }

  interface Window {
    jQuery: JQueryStatic;
    $: JQueryStatic;
  }
}
