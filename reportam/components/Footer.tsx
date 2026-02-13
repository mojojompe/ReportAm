export function Footer() {
    return (
        <footer className="w-full py-6 border-t border-[#EAECF0] bg-white mt-auto">
            <div className="container px-4 md:px-6 mx-auto text-center">
                <p className="text-sm text-[#64748B]">
                    © {new Date().getFullYear()} ReportAm. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
