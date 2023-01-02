**Overview**
Some applications require or benefit from human intelligence (e.g. data annotation, content moderation, consumer research). This projects intends to build standardized primitives and interfaces for human intelligence tasks in DAOs, and their integration in automated algorithmic flows, beyond yay/nay voting on proposals.

**Background**
Promising results, reported in the early 2010’s with Amazon’s mechanical Turk, showed how the intelligence of crowds can be integrated to software. However, Turkit, the software kit born out of these early efforts, did not have much applications beyond academia.

Independently, the advent of DAOs shows promises for decentralized, coordinated decision-making. However, current modular DAO tools seem to have made the following, limiting design choices:

Human intelligence tasks are limited to a binary vote on proposals (yay or nay), with limited modularity regarding the aggregation procedure for votes.
Integration in software are one-off; limited to a submission of a proposal for voting and eventual call to a contract based on the result of the vote.
Submissions are made by human operators and do not make use of artificial intelligence.
The stack is limited to Web3 and does not consider e.g. Discord as part of the scope of the tooling for DAOs.
The standardization and expansion of tasks requiring human intelligence can allow for the expression and rapid development of a wide-range of applications, in a unified language. Examples can be found in the Section Example Applications.
**Definition of terms**
*Human Intelligence Primitives (HIP, after TurKit)*
A fundamental decision problem submitted to individual members of a DAO, and an aggregation procedure for individual submissions.

*Decision Problems*
The following classical problems are considered:

Choice: Selecting the best alternative in a finite set. Yay/Nay is here, with a two-set.
Ranking: Ranking alternatives in a finite set.
Sorting: Assigning alternatives from a finite set to ordered classes (e.g. Good, Average, Bad).
Classification: Assigning alternatives from a finite set to unordered classes (e.g. Dog, Cat, Bird).
Search: Generating a string from an infinite set (e.g. recommend a movie to watch tonight, show me a completion hash for this tutorial).
Actions
Procedures performed by the machine with the output of a HIP as input, and/or a call to a HIP as output.

**Example applications**
The DAOkit provides a common language that can automate/modularize services as disparate as Earn.com, the Mechanical Turk, Customer Surveys, Discord Mod Elections, Human-Annotated Datasets, what have you… Examples follow.


*Building annotated-datasets for machine learning*
Creator chooses duration and rewards and pays fee corresponding to the primitives needed.
Calls a classification primitive.
Some aggregation procedure (e.g. most common category for an object among participants).
Contract pays participants and delivers results.
*Earn.com*
Creator chooses minimum and maximum participants and their rewards and pays fee corresponding to the primitives needed.
Calls a search primitive (generating a string corresponding to the completion hash for a course).
No aggregation.
Contract pays participants and delivers results.
*Customer surveys*
Creator chooses minimum and maximum participants and their rewards and pays fee corresponding to the primitives needed.
Calls a ranking primitive for say different designs of a product.
Some aggregation procedure (e.g. Borda count).
Calls a ranking primitive for say different designs of a product.
Contract pays participants and delivers results.
