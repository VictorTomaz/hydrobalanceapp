import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Something went wrong" };
  }

  handleReload = () => {
    this.setState({ hasError: false, message: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#F7FBFD] dark:bg-slate-900">
          <div className="text-5xl mb-3">💧</div>
          <h1 className="font-heading text-2xl font-extrabold text-[#3A4759] dark:text-slate-100 mb-1">
            Oops, a little spill
          </h1>
          <p className="text-[#8A97A8] dark:text-slate-400 mb-6 max-w-xs">
            HydroBalance hit an unexpected snag. A quick reload usually gets things flowing again.
          </p>
          <button
            onClick={this.handleReload}
            className="rounded-xl bg-[#2BC4BB] hover:bg-[#22A99F] text-white font-heading font-bold px-6 h-12"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}