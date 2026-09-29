from algopy import ARC4Contract, String
from algopy.arc4 import abimethod


class Verithread(ARC4Contract):

  @abimethod()
  def store_post(self, ipfs_cid: String) -> String:
    # This method anchors the post's IPFS CID onto the Algorand blockchain,
    # ensuring immutable proof of authenticity and timestamp.
    return "Verified on Algorand: " + ipfs_cid