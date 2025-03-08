import Link from "next/link";
import blockchainImage from "@/images/blockchain-bg.webp";

const Navbar = () => {
  return (
    <nav
      className="fixed top-0 left-0 w-full z-10 backdrop-blur-2xl shadow-sm bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, #0a0a0a, transparent 100%), url('${blockchainImage.src}')`,
      }}
    >
      <div className="container mx-auto p-4 flex items-center text-white justify-between">
        <Link href="/" prefetch className="font-bold text-lg">
          Voysa
        </Link>
          {/* <Link href="/#api" prefetch className="text-sm hover:underline">
            API
          </Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
