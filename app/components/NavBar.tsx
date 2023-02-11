export default function NavBar() {
  return (
    <nav className="w-full border-amber-200 bg-green-500 py-4 shadow">
      <div className="container mx-auto flex w-full flex-wrap items-center justify-between">
        <nav>
          <ul className="flex items-center justify-between text-sm font-bold uppercase text-white no-underline">
            <li>
              <a className="px-4 hover:text-gray-200 hover:underline" href="#">
                About
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center pr-6 text-lg text-white no-underline">
          <a className="" href="#">
            <i className="fab fa-facebook"></i>
          </a>
          <a className="pl-6" href="#">
            <i className="fab fa-instagram"></i>
          </a>
          <a className="pl-6" href="#">
            <i className="fab fa-twitter"></i>
          </a>
          <a className="pl-6" href="#">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>
      </div>
    </nav>
  );
}
